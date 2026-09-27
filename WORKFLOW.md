# Comparative Report: Vague vs. Structured AI Prompting Workflows

## Overview
This report evaluates the execution outcomes between a vague AI prompt (`feature-vague-prompt`) and a structured AI prompt (`feature-structured-prompt`) during the Foundations drill.

## Comparison Matrix

| Metric | Vague Prompt Workflow | Structured Prompt Workflow |
| :--- | :--- | :--- |
| **Prompt Used** | "Build a settings form with validation." | Detailed prompt specifying React, TypeScript, Zod, ARIA, and RTL unit tests. |
| **Validation Architecture** | Basic custom state or inline checks | Standardized `react-hook-form` + `zod` schema |
| **Accessibility (a11y)** | Generic HTML without explicit ARIA bindings | Explicit `<label>` bindings with `aria-invalid` and `aria-describedby` |
| **Testing Coverage** | Zero unit tests generated | Automated unit tests (`SettingsForm.test.tsx`) covering key user paths |
| **Code Predictability** | High ambiguity; requires manual refactoring | Production-ready, deterministic output matching technical specifications |

## Conclusion
Structured prompting significantly reduces engineering overhead by enforcing explicit technical requirements, accessibility standards, and unit test coverage upfront.