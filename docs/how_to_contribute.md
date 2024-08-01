# How to Contribute to Proof Arena

This article describes how to add a problem or submit your solutions for existing problems.

## Add Your Problems

Problems are written in markdown under the directory of `/docs`. Different problmes are stored in seperated folders as following structure.

```
+ <problem_name>
|- problem.md: markdown file for the problem with defined properties in front matter format.
|- submissions.json: generated submission results in json, used for rendering table metrics and plots.
```

To add a problem, please add your problem by creating a new directory under `/docs`, and write `<problem_folder>/problem.md` in following format.

```
---
problem_id: <id of the problem, please make sure it is unique to others>
title: <problem title>
description: (optional, short description used on the listing page)
draft: false <true if you don't your problem to be listed>
enable_comments: false <true, if you want to disable comments>
proposer: Polyhedra Network <contributor's name>
proposer_icon: assets/icons/xxx.png (24x24) <optional, if you have to display your icon with proposer, then add icon in assets/icons, png/svg extension only>
---

## Problem Description

<content goes here>
```

## Submit Your Solution for Existing Problems

TBD

