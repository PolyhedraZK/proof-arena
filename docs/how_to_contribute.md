# How to Contribute to Proof Arena

This article outlines how to submit a new problem or contribute your solutions for existing ones.

## Submitting a New Problem


Problems are documented in Markdown format within the /docs directory. Each problem is organized into separate folders, following this structure:

```
/docs
└── <problem_name>
    ├── problem.md         # Problem description in Markdown with front matter properties
    └── submissions.json   # Auto-generated JSON file containing submission results,
                           # used for rendering metrics tables and plots
```

To add a problem, create a new directory under /docs and write the problem description in <problem_folder>/problem.md using the following format:

```
---
problem_id: <unique_problem_id>  # Ensure this ID is unique
title: <problem_title>
description: <optional_short_description>  # Used on the listing page
draft: false  # Set to true if you don't want your problem to be listed
enable_comments: false  # Set to true if you want to disable comments
proposer: Polyhedra Network  # Contributor's name
proposer_icon: assets/icons/xxx.png  # Optional: 24x24 icon for the proposer, use PNG/SVG format
---

## Problem Description

<content goes here>
```

## Contributing Solutions to Existing Problems

TDB

