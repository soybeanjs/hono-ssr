import type { Env } from 'hono';
import { validator } from 'hono-openapi';
import { pipe, object, string, description } from 'valibot';
import { createDefineRoute } from '../src/route';

const defineRoute = createDefineRoute<Env, { public?: boolean }>();

const userSchema = object({
  name: pipe(string(), description("The user's name")),
  email: pipe(string(), description("The user's email"))
});

defineRoute(validator('json', userSchema), c => {
  const { name, email } = c.req.valid('json');
  return c.json({ name, email });
}).meta({ public: true });
