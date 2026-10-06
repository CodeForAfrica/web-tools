package main

import (
	"encoding/json"
	"testing"
)

func TestResolveRejectsBackendOutputsAndMissingService(t *testing.T) {
	raw := map[string]json.RawMessage{}
	for _, key := range []string{"civicsignalFrontendUrl", "civicsignalAwsRegion", "civicsignalFrontendDeployGithubRoleArn", "civicsignalFrontendClusterName", "civicsignalFrontendServiceName", "civicsignalFrontendTaskFamily", "civicsignalFrontendContainerName", "civicsignalFrontendRepositoryName"} {
		raw[key] = json.RawMessage(`"value"`)
	}
	raw["civicsignalFrontendUrl"] = json.RawMessage(`"https://explorer.civicsignal.dev.codeforafrica.org"`)
	raw["civicsignalFrontendContainerName"] = json.RawMessage(`"web-tools"`)
	if _, err := resolve(raw); err != nil {
		t.Fatal(err)
	}
	raw["civicsignalFrontendUrl"] = json.RawMessage(`"https://backend.civicsignal.dev.codeforafrica.org"`)
	if _, err := resolve(raw); err == nil {
		t.Fatal("backend endpoint must not be used to deploy frontend")
	}
	delete(raw, "civicsignalFrontendServiceName")
	if _, err := resolve(raw); err == nil {
		t.Fatal("missing frontend service must fail")
	}
}
