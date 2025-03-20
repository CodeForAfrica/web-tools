#!/bin/bash
exec gunicorn server:app -k gevent --timeout 500
