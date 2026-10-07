package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func resolve(raw map[string]json.RawMessage) (map[string]string, error) {
	keys := map[string]string{"app-url": "civicsignalFrontendUrl", "aws-region": "civicsignalAwsRegion", "aws-role-to-assume": "civicsignalFrontendDeployGithubRoleArn", "ecs-cluster-name": "civicsignalFrontendClusterName", "ecs-service-name": "civicsignalFrontendServiceName", "task-family": "civicsignalFrontendTaskFamily", "container-name": "civicsignalFrontendContainerName", "ecr-repository": "civicsignalFrontendRepositoryName"}
	result := map[string]string{}
	for name, key := range keys {
		var value string
		if json.Unmarshal(raw[key], &value) != nil || value == "" || strings.ContainsAny(value, "\r\n") {
			return nil, fmt.Errorf("missing or invalid infrastructure output %s", key)
		}
		result[name] = value
	}
	if result["container-name"] != "web-tools" || result["app-url"] != "https://explorer.civicsignal.dev.codeforafrica.org" {
		return nil, fmt.Errorf("outputs do not describe the CivicSignal dev frontend")
	}
	return result, nil
}
func main() {
	if len(os.Args) != 2 {
		panic("usage: runtime-contract stack-outputs.json")
	}
	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	var raw map[string]json.RawMessage
	if err = json.Unmarshal(data, &raw); err != nil {
		panic(err)
	}
	values, err := resolve(raw)
	if err != nil {
		panic(err)
	}
	output, err := os.OpenFile(os.Getenv("GITHUB_OUTPUT"), os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		panic(err)
	}
	defer output.Close()
	for key, value := range values {
		fmt.Fprintf(output, "%s=%s\n", key, value)
	}
}
