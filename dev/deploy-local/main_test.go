package main

import (
	"encoding/json"
	"testing"
)

func fixture() map[string]json.RawMessage {
	values := map[string]string{"civicsignalAwsRegion": "eu-west-1", "civicsignalFrontendClusterName": "dev-cluster", "civicsignalFrontendServiceName": "frontend-service", "civicsignalFrontendTaskFamily": "frontend-task", "civicsignalFrontendRepositoryName": "dev/frontend", "civicsignalFrontendContainerName": "web-tools", "civicsignalFrontendUrl": "https://explorer.civicsignal.dev.codeforafrica.org"}
	raw := map[string]json.RawMessage{}
	for name, value := range values {
		raw[name], _ = json.Marshal(value)
	}
	return raw
}
func TestRejectsBackendAndCrossAccountOutputs(t *testing.T) {
	if _, err := resolve(fixture(), "499665620971"); err != nil {
		t.Fatal(err)
	}
	if _, err := resolve(fixture(), "000000000000"); err == nil {
		t.Fatal("accepted wrong account")
	}
	for _, key := range []string{"civicsignalFrontendContainerName", "civicsignalFrontendUrl", "civicsignalFrontendServiceName"} {
		raw := fixture()
		raw[key] = json.RawMessage(`"backend"`)
		if key == "civicsignalFrontendServiceName" {
			delete(raw, key)
		}
		if _, err := resolve(raw, "499665620971"); err == nil {
			t.Fatalf("accepted invalid %s", key)
		}
	}
}
func TestOnlyStableRunningReleaseIsRollbackCandidate(t *testing.T) {
	var s state
	if err := json.Unmarshal([]byte(`{"taskDefinition":"arn","desiredCount":1,"runningCount":1,"pendingCount":0,"deployments":[{"taskDefinition":"arn","rolloutState":"COMPLETED"}]}`), &s); err != nil {
		t.Fatal(err)
	}
	if !ready(s, "arn") {
		t.Fatal("stable release rejected")
	}
	for _, change := range []func(*state){func(s *state) { s.PendingCount = 1 }, func(s *state) { s.RunningCount = 0 }, func(s *state) { s.DesiredCount = 0 }, func(s *state) { s.TaskDefinition = "other" }, func(s *state) { s.Deployments[0].RolloutState = "FAILED" }, func(s *state) { s.Deployments[0].TaskDefinition = "other" }} {
		copy := s
		copy.Deployments = append(copy.Deployments[:0:0], s.Deployments...)
		change(&copy)
		if ready(copy, "arn") {
			t.Fatal("unsafe rollback candidate accepted")
		}
	}
}
