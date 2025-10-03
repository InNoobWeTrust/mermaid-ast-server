# Makefile for mermaid-parser-server

# Use npx corepack pnpm for all pnpm commands
PNPM := npx corepack pnpm

.PHONY: help install start test lint lint-fix clean

# Default target
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  install     Install project dependencies"
	@echo "  start       Start the HTTP server"
	@echo "  test        Run the test suite"
	@echo "  lint        Check code for style issues"
	@echo "  lint-fix    Fix code style issues automatically"
	@echo "  clean       Remove installed dependencies (node_modules)"

install:
	@$(PNPM) install

start:
	@$(PNPM) start

test:
	@$(PNPM) test

lint:
	@$(PNPM) lint

lint-fix:
	@$(PNPM) lint:fix

clean:
	@echo "Removing node_modules..."
	@rm -rf node_modules
