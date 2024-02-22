import { redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";
import { destroySession, getSession } from "./session.server";

export function links() {
  return [{ rel: "stylesheet", href: stylesheet }];
}

export function meta() {
  return [{ title: "Work Journal" }];
}

/* ACTION --------------------------------------------------------- */
export async function action({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

/* LOADER --------------------------------------------------------- */
export async function loader({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  return { session: session.data };
}

/* UI ------------------------------------------------------------- */
export default function App() {
  const { session } = useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl">Work Journal</h1>
              <p className="mt-2 text-lg text-gray-400">
                Learnings and doings. Updated weekly.
              </p>
            </div>

            {session.isAdmin ? (
              <Form method="post">
                <button>Logout</button>
              </Form>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>

          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
