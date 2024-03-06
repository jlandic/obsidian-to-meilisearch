# Meilisearch Exporter

This is a plugin for Obsidian (https://obsidian.md), designed to export all the Obsidian document from your vault to a Meilisearch (https://meilisearch.com) index.

**Note:** This project is very much "work in progress", and currently for my own use only. User discretion is advised :pray:

## Installation

Completely manual for now.

Please follow the instructions from the (obsidian-sample-plugin README)[https://github.com/obsidianmd/obsidian-sample-plugin?tab=readme-ov-file#first-time-developing-plugins]

## Configuration

Under the **Community plugins** settings, find **Meilisearch Exporter**.
Fill in the following information:
- Host of your Meilisearch instance
- The API key to use to push documents
- The name of the index to push documents to

In its current state, the schema of the document is completely hardcoded, and cannot be configured.
