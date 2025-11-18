# SOLUTION.md

## General Approach

I completed each exercise as an independent TypeScript module rather than generating a full NestJS project. This was an intentional assumption based on the structure of the assessment, which evaluates architecture, clarity, and error handling rather than requiring a runnable Nest application. All solutions follow NestJS patterns (services, schemas, error handling, dependency conventions) but remain self-contained for readability.

## Design Decisions and Trade-offs

I focused on delivering clear, maintainable solutions that follow NestJS patterns without building a full application. The main trade-off was keeping each exercise self-contained rather than wiring complete modules, controllers, and infrastructure. This kept the code readable and aligned with the assessment’s intent, prioritizing logic and structure over runtime setup.

## Improvements With More Time

With more time, I would add Jest tests for all exercises, extract email templates into separate files, introduce DTO validation, strengthen type safety for external API errors, and implement the solutions inside a full NestJS workspace to show complete provider wiring and module structure.

---

## Exercise 1 – User Statistics Service (18 minutes)

I implemented a NestJS-style service that retrieves user statistics through a Mongoose model injected with `@InjectModel`. The method handles missing users with `NotFoundException`, wraps unexpected errors in `InternalServerErrorException`, and logs issues using `Logger`. The output is a concise statistics object. This approach assumes schema registration happens in the surrounding NestJS environment.

---

## Exercise 2 – Retry Utility (28 minutes)

I built a generic `callWithRetry` function that performs exponential backoff, respects `retryAfter` values, and retries only for allowed status codes. The function logs each attempt and returns detailed attempt metadata when retries are exhausted. It is framework-agnostic but compatible with NestJS via an optional logger. The solution assumes external API errors follow a `{ statusCode, message, retryAfter }` shape.

---

## Exercise 3 – Aggregated Model Request Report (18 minutes)

I created a MongoDB aggregation pipeline using `$match`, `$lookup`, `$sort`, and `$facet` to produce paginated results, total counts, and grouped status counts in a single query. This avoids N+1 lookups and keeps all reporting logic inside the database. The solution also includes index recommendations based on filter patterns. It assumes both schemas are registered in a real NestJS module.

---

## Exercise 4 – Email Service Refactor (30 minutes)

I refactored the email service by introducing a template builder and a unified `sendEmail` method, eliminating duplication. Configuration is validated with `ConfigService`, dynamic content is HTML-escaped to prevent XSS, and SendGrid calls are wrapped with structured error handling and logging. This makes the service safer, more maintainable, and more aligned with NestJS practices.

---

## Time Breakdown (from Git history)

- Exercise 1: ~18 minutes
- Exercise 2: ~28 minutes
- Exercise 3: ~18 minutes
- Exercise 4: ~30 minutes
