// deploy-local releases only the CivicSignal frontend using the shared ECS image helper.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type deployment struct{ Region, Cluster, Service, Family, Repository, Container, URL string }
type state struct {
	TaskDefinition                           string
	DesiredCount, RunningCount, PendingCount int
	Deployments                              []struct{ TaskDefinition, RolloutState string }
}

func logf(format string, args ...any) { fmt.Printf("[frontend-deploy] "+format+"\n", args...) }
func command(ctx context.Context, env []string, name string, args ...string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, name, args...)
	cmd.Env = append(os.Environ(), env...)
	return cmd
}
func capture(ctx context.Context, env []string, name string, args ...string) ([]byte, error) {
	cmd := command(ctx, env, name, args...)
	var diagnostics bytes.Buffer
	cmd.Stderr = &diagnostics
	data, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("%s failed (%v); inspect credentials/permissions", name, err)
	}
	return data, nil
}
func stream(ctx context.Context, env []string, name string, args ...string) error {
	cmd := command(ctx, env, name, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
func resolve(raw map[string]json.RawMessage, account string) (deployment, error) {
	var p deployment
	fields := map[string]*string{"civicsignalAwsRegion": &p.Region, "civicsignalFrontendClusterName": &p.Cluster, "civicsignalFrontendServiceName": &p.Service, "civicsignalFrontendTaskFamily": &p.Family, "civicsignalFrontendRepositoryName": &p.Repository, "civicsignalFrontendContainerName": &p.Container, "civicsignalFrontendUrl": &p.URL}
	for key, value := range fields {
		if json.Unmarshal(raw[key], value) != nil || *value == "" || strings.ContainsAny(*value, "\r\n") {
			return p, fmt.Errorf("missing or invalid frontend output %s", key)
		}
	}
	if account != "499665620971" || p.Region != "eu-west-1" || p.Container != "web-tools" || p.URL != "https://explorer.civicsignal.dev.codeforafrica.org" {
		return p, errors.New("expected CivicSignal dev frontend outputs/account")
	}
	if !regexp.MustCompile(`^[a-z0-9/_-]+$`).MatchString(p.Repository) {
		return p, errors.New("invalid frontend ECR repository")
	}
	return p, nil
}
func getState(ctx context.Context, env []string, p deployment) (state, error) {
	var s state
	raw, err := capture(ctx, env, "aws", "ecs", "describe-services", "--cluster", p.Cluster, "--services", p.Service, "--query", "services[0]", "--output", "json")
	if err != nil {
		return s, err
	}
	if json.Unmarshal(raw, &s) != nil || s.TaskDefinition == "" {
		return s, errors.New("frontend ECS service is absent")
	}
	if !strings.Contains(s.TaskDefinition, ":task-definition/"+p.Family+":") {
		return s, errors.New("frontend service task family does not match deployment outputs")
	}
	return s, nil
}
func ready(s state, arn string) bool {
	return s.TaskDefinition == arn && s.DesiredCount > 0 && s.RunningCount == s.DesiredCount && s.PendingCount == 0 && len(s.Deployments) == 1 && s.Deployments[0].TaskDefinition == arn && s.Deployments[0].RolloutState == "COMPLETED"
}
func wait(ctx context.Context, env []string, p deployment, arn string) error {
	for attempt := 1; attempt <= 60; attempt++ {
		s, err := getState(ctx, env, p)
		if err != nil {
			return err
		}
		if ready(s, arn) {
			logf("ECS frontend deployment stable")
			return nil
		}
		if s.TaskDefinition != arn {
			return errors.New("frontend task definition changed during release")
		}
		for _, d := range s.Deployments {
			if d.TaskDefinition == arn && d.RolloutState == "FAILED" {
				return errors.New("ECS frontend deployment failed")
			}
		}
		logf("Waiting for frontend stability, attempt %d/60 (running=%d desired=%d pending=%d)", attempt, s.RunningCount, s.DesiredCount, s.PendingCount)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(15 * time.Second):
		}
	}
	return errors.New("frontend deployment did not stabilize")
}
func release(ctx context.Context, env []string, p deployment, infra, tmp, localImage string) error {
	registry := "499665620971.dkr.ecr.eu-west-1.amazonaws.com"
	tag := "local-" + time.Now().UTC().Format("20060102150405")
	image := registry + "/" + p.Repository + ":" + tag
	if localImage == "" {
		logf("Building one production frontend image (linux/amd64)")
		if err := stream(ctx, env, "docker", "build", "--platform", "linux/amd64", "--target", "web-tools-runner", "--tag", image, "."); err != nil {
			return err
		}
	} else {
		raw, err := capture(ctx, env, "docker", "image", "inspect", "--format", "{{.Os}}/{{.Architecture}}", localImage)
		if err != nil {
			return err
		}
		if strings.TrimSpace(string(raw)) != "linux/amd64" {
			return errors.New("local image must be linux/amd64")
		}
		logf("Using explicitly selected local image %s", localImage)
		if err := stream(ctx, env, "docker", "tag", localImage, image); err != nil {
			return err
		}
	}
	logf("Validating Python startup imports and image security gate")
	if err := stream(ctx, env, "docker", "run", "--rm", "--platform", "linux/amd64", "--entrypoint", "python", image, "-c", "import pymongo, redis; import importlib.util; spec=importlib.util.spec_from_file_location('runtime','/usr/local/bin/webtools.py'); module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)"); err != nil {
		return err
	}
	cache := filepath.Join(os.TempDir(), "civicsignal-trivy-cache")
	if err := os.MkdirAll(cache, 0700); err != nil {
		return err
	}
	if err := stream(ctx, env, "docker", "run", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock:ro", "-v", cache+":/root/.cache/trivy", "-v", tmp+":/reports", "aquasec/trivy:0.70.0", "image", "--severity", "CRITICAL,HIGH", "--ignore-unfixed", "--exit-code", "1", "--format", "json", "--output", "/reports/scan.json", image); err != nil {
		return errors.New("frontend image security gate failed; private scan report withheld")
	}
	logf("Image security gate passed; authenticating to ECR")
	password, err := capture(ctx, env, "aws", "ecr", "get-login-password")
	if err != nil {
		return err
	}
	login := command(ctx, env, "docker", "login", "--username", "AWS", "--password-stdin", registry)
	login.Stdin = bytes.NewReader(password)
	login.Stdout = os.Stdout
	login.Stderr = os.Stderr
	if err = login.Run(); err != nil {
		return err
	}
	logf("Publishing frontend image to %s", p.Repository)
	if err = stream(ctx, env, "docker", "push", image); err != nil {
		return err
	}
	digest, err := capture(ctx, env, "aws", "ecr", "describe-images", "--repository-name", p.Repository, "--image-ids", "imageTag="+tag, "--query", "imageDetails[0].imageDigest", "--output", "text")
	if err != nil {
		return err
	}
	immutable := strings.TrimSpace(string(digest))
	if !regexp.MustCompile(`^sha256:[a-f0-9]{64}$`).MatchString(immutable) {
		return errors.New("frontend image digest unavailable")
	}
	helper := filepath.Join(tmp, "ecs-release-images")
	logf("Compiling shared ECS release helper")
	if err = stream(ctx, env, "go", "build", "-o", helper, filepath.Join(infra, "tools/ecs-release-images/main.go")); err != nil {
		return err
	}
	base, err := capture(ctx, env, "aws", "ecs", "describe-task-definition", "--task-definition", p.Family, "--query", "taskDefinition", "--output", "json")
	if err != nil {
		return err
	}
	input, output := filepath.Join(tmp, "base.json"), filepath.Join(tmp, "release.json")
	if err = os.WriteFile(input, base, 0600); err != nil {
		return err
	}
	patchEnv := append(append([]string{}, env...), "CONTAINER_NAME="+p.Container, "IMAGE_REF="+registry+"/"+p.Repository+"@"+immutable, "ECR_REGISTRY="+registry, "RELEASE_IMAGES_DIR=")
	if err = stream(ctx, patchEnv, helper, "patch", input, output); err != nil {
		return err
	}
	previous, err := getState(ctx, env, p)
	if err != nil {
		return err
	}
	registered, err := capture(ctx, env, "aws", "ecs", "register-task-definition", "--cli-input-json", "file://"+output, "--query", "taskDefinition.taskDefinitionArn", "--output", "text")
	if err != nil {
		return err
	}
	arn := strings.TrimSpace(string(registered))
	if !strings.HasPrefix(arn, "arn:aws:ecs:eu-west-1:499665620971:task-definition/") {
		return errors.New("invalid frontend task definition ARN")
	}
	logf("Deploying only frontend service %s with immutable digest %s", p.Service, immutable)
	if _, err = capture(ctx, env, "aws", "ecs", "update-service", "--cluster", p.Cluster, "--service", p.Service, "--task-definition", arn, "--desired-count", "1"); err != nil {
		return err
	}
	if err = wait(ctx, env, p, arn); err != nil {
		current, readErr := getState(ctx, env, p)
		if readErr == nil && current.TaskDefinition == arn && ready(previous, previous.TaskDefinition) {
			logf("Release failed; restoring verified previous frontend task definition")
			if _, restoreErr := capture(ctx, env, "aws", "ecs", "update-service", "--cluster", p.Cluster, "--service", p.Service, "--task-definition", previous.TaskDefinition); restoreErr != nil {
				return fmt.Errorf("%w; rollback update failed", err)
			}
			if restoreErr := wait(ctx, env, p, previous.TaskDefinition); restoreErr != nil {
				return fmt.Errorf("%w; rollback did not stabilize", err)
			}
		} else {
			logf("No safe previous frontend release to restore; leaving failure visible")
		}
		return err
	}
	logf("Checking all four public frontend hostnames")
	return stream(ctx, env, "go", "run", "dev/verify-health/main.go")
}
func run(ctx context.Context) error {
	infra := flag.String("infra-repo", "../iac-cfa-pulumi", "IaC checkout with the CivicSignal stack and shared release helper")
	profile := flag.String("profile", "cfa-bootstrap", "AWS profile")
	check := flag.Bool("check", false, "resolve and validate frontend infrastructure without release")
	localImage := flag.String("local-image", "", "optional already-built linux/amd64 image; security gates still run")
	flag.Parse()
	if flag.NArg() != 0 {
		return errors.New("unexpected arguments")
	}
	absolute, err := filepath.Abs(*infra)
	if err != nil {
		return err
	}
	env := []string{"AWS_PROFILE=" + *profile, "AWS_REGION=eu-west-1", "AWS_DEFAULT_REGION=eu-west-1"}
	logf("Resolving CivicSignal dev frontend outputs")
	raw, err := capture(ctx, env, "pulumi", "stack", "output", "--json", "--stack", "dev", "--cwd", filepath.Join(absolute, "aws/account-499665620971-main/apps/civicsignal"))
	if err != nil {
		return err
	}
	var outputs map[string]json.RawMessage
	if err = json.Unmarshal(raw, &outputs); err != nil {
		return err
	}
	account, err := capture(ctx, env, "aws", "sts", "get-caller-identity", "--query", "Account", "--output", "text")
	if err != nil {
		return err
	}
	p, err := resolve(outputs, strings.TrimSpace(string(account)))
	if err != nil {
		return err
	}
	if _, err = getState(ctx, env, p); err != nil {
		return err
	}
	logf("Verified frontend service %s at %s", p.Service, p.URL)
	if *check {
		return nil
	}
	tmp, err := os.MkdirTemp("", "civicsignal-frontend-release-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tmp)
	return release(ctx, env, p, absolute, tmp, *localImage)
}
func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	if err := run(ctx); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
