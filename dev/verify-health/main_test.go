package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCheckRejectsWrongHostDependencyFailureAndMissingPage(t *testing.T) {
	for _, test := range []struct {
		name, body   string
		health, page int
		valid        bool
	}{
		{"healthy", `{"status":"ok","app":"topics"}`, 200, 200, true},
		{"wrong host", `{"status":"ok","app":"explorer"}`, 200, 200, false},
		{"dependency down", `{"status":"unavailable","app":"topics"}`, 503, 200, false},
		{"page down", `{"status":"ok","app":"topics"}`, 200, 500, false},
	} {
		t.Run(test.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path == "/healthz" {
					w.WriteHeader(test.health)
					w.Write([]byte(test.body))
					return
				}
				w.WriteHeader(test.page)
			}))
			defer server.Close()
			err := check(server.Client(), server.URL, "topics")
			if (err == nil) != test.valid {
				t.Fatalf("unexpected health result: %v", err)
			}
		})
	}
}
