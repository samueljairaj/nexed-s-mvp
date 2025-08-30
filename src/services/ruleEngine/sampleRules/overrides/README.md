# University Overrides

This folder contains university-specific overrides layered on top of the built-in rule library. Use overrides to tweak task wording, priorities, dates, or dependencies without modifying core rules.

## How overrides work

- Identify the base `ruleId` from built-in rules
- Provide partial `taskTemplate` fields or `priority` to override
- Optionally scope by `universityId`

## Example structure

```json
{
  "universityId": "univ_example_001",
  "overrides": [
    {
      "ruleId": "f1-passport-renewal-urgent",
      "priority": 92,
      "taskTemplate": {
        "titleTemplate": "Renew Passport - University Requirement",
        "descriptionTemplate": "{universityName} requires passports valid for 6+ months. {#days_until_passport_expiry} days left.",
        "dueDateConfig": {
          "type": "relative",
          "baseDate": "dates.passportExpiryDate",
          "offset": "-120days"
        }
      }
    }
  ]
}
```

Note: Loading/merging of overrides is handled by the rule engine/services. The engine currently reads per-rule overrides from `taskTemplate.universityOverrides[<universityId>]`. If you use top-level override bundles (as in this README), ensure a loader transforms them into the per-rule structure before invoking the engine. Merge semantics: deep-merge `taskTemplate` fields; `priority` is replaced; `null` removes the field.


