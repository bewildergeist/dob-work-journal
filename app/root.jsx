import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";

export function links() {
  return [{ rel: "stylesheet", href: stylesheet }];
}

export function meta() {
  return [{ title: "Work Journal" }];
}

export default function App() {
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
          <h1 className="text-5xl">Work Journal</h1>
          <p className="mt-2 text-lg text-gray-400">
            Learnings and doings. Updated weekly.
          </p>

          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
