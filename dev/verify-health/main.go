package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

func check(client *http.Client, origin, app string) error {
	response, err := client.Get(origin + "/healthz")
	if err != nil {
		return err
	}
	defer response.Body.Close()
	var health struct {
		Status string `json:"status"`
		App    string `json:"app"`
	}
	if response.StatusCode != http.StatusOK || json.NewDecoder(io.LimitReader(response.Body, 4096)).Decode(&health) != nil || health.Status != "ok" || health.App != app {
		return fmt.Errorf("%s aggregate health or hostname routing failed", app)
	}
	page, err := client.Get(origin + "/")
	if err != nil {
		return err
	}
	defer page.Body.Close()
	if page.StatusCode != http.StatusOK {
		return fmt.Errorf("%s page returned %d", app, page.StatusCode)
	}
	return nil
}
func main() {
	client := &http.Client{Timeout: 10 * time.Second}
	for _, app := range []string{"explorer", "sources", "topics", "tools"} {
		origin := "https://" + app + ".civicsignal.dev.codeforafrica.org"
		var err error
		for attempt := 1; attempt <= 24; attempt++ {
			err = check(client, origin, app)
			if err == nil {
				break
			}
			fmt.Printf("[health] %s waiting (%d/24): %v\n", app, attempt, err)
			if attempt < 24 {
				time.Sleep(10 * time.Second)
			}
		}
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		fmt.Printf("[health] %s: aggregate dependencies, host routing and page passed\n", app)
	}
}
