---
agent: agent
---

Research the provided question and generate a phased implementation plan.

Draft a short implementation plan that just focuses on the main steps. Ensure that the plan is logical and that each phase builds upon the previous one. 

Include a proposed commit message for each phase of the plan. Each commit message should be concise yet descriptive, summarizing the changes made in that phase. 

Each phase should be broken down into clear, actionable steps that can be followed to achieve the overall goal. 

Each phase should include updates to unit tests, where appropriate. E2E tests can be updated as a final phase.

Only include the implementation plan. Do not include other sections like "Success Criteria", "Migration Plan", "Technical Considerations", "Rollback Plan", "Future Enhancements".
Do not include timelines or resource estimates.
Do not execute any code or commands; focus solely on planning and structuring the implementation.
Do not provide any code unless specifically requested in the question.

In the plan, look for: 
- Refactor opportunities to simplify the code as part of the plan.
- Names that may need to be updated as part of the plan.

In the plan, include style guidelines: 
- Follow the style of the existing code. 
- Do not add JSDoc comments unless absolutely necessary.
- Follow the principles of self-documenting code. 
- Comments should only be added where they provide additional context or explanation that is not immediately clear from the code itself. 
- Do not add comments that can be directly explained by the code itself.

Write the plan in markdown format for easy readability.
Write the plan to tmp/{CONCISE_PLAN_NAME}.md, where {CONCISE_PLAN_NAME} is a short, descriptive name for the plan derived from the question.