import { Link, useLoaderData } from "@remix-run/react";
import { format, startOfWeek, parseISO } from "date-fns";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session.server";

/* ACTION --------------------------------------------------------- */
export async function action({ request }) {
  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  let formData = await request.formData();

  // Artificially slow down the form submission to show pending UI
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mongoose will throw an error if the entry data is invalid (and we don't
  // catch it here, so it will be caught by Remix's error boundary and displayed
  // to the user — we can improve on that later)
  return mongoose.models.Entry.create({
    date: new Date(formData.get("date")),
    type: formData.get("type"),
    text: formData.get("text"),
  });
}

/* LOADER --------------------------------------------------------- */
export async function loader({ request }) {
  let session = await getSession(request.headers.get("cookie"));

  // We're using `lean` here to get plain objects instead of Mongoose documents
  // so we can map over them:
  // https://mongoosejs.com/docs/api/query.html#Query.prototype.lean()
  // We're calling `exec` to execute the query and return a promise:
  // https://mongoosejs.com/docs/promises.html#should-you-use-exec-with-await
  const entries = await mongoose.models.Entry.find()
    .sort({ date: -1 })
    .lean()
    .exec();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

/* UI ------------------------------------------------------------- */
export default function Index() {
  const { session, entries } = useLoaderData();

  const entriesByWeek = entries.reduce((memo, entry) => {
    let sunday = startOfWeek(parseISO(entry.date));
    let sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek).map((dateString) => ({
    dateString,
    work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
    learnings: entriesByWeek[dateString].filter(
      (entry) => entry.type === "learning",
    ),
    interestingThings: entriesByWeek[dateString].filter(
      (entry) => entry.type === "interesting-thing",
    ),
  }));

  return (
    <div>
      {session.isAdmin && (
        <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
          <p className="text-sm font-medium text-gray-500 lg:text-base">
            New entry
          </p>

          <EntryForm />
        </div>
      )}

      <div className="mt-12 space-y-12 border-l-2 border-sky-500/[.15] pl-5 lg:space-y-20 lg:pl-8">
        {weeks.map((week) => (
          <div key={week.dateString} className="relative">
            <div className="absolute left-[-34px] rounded-full bg-gray-900 p-2 lg:left-[-46px]">
              <div className="h-[10px] w-[10px] rounded-full border border-sky-500 bg-gray-900" />
            </div>

            <p className="pt-[5px] text-xs font-semibold uppercase tracking-wider text-sky-500 lg:pt-[3px] lg:text-sm">
              Week of {format(parseISO(week.dateString), "MMMM d, yyyy")}
            </p>

            <div className="mt-6 space-y-8 lg:space-y-12">
              <EntryList entries={week.work} label="Work" />
              <EntryList entries={week.learnings} label="Learnings" />
              <EntryList
                entries={week.interestingThings}
                label="Interesting things"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryList({ entries, label }) {
  return entries.length > 0 ? (
    <div>
      <p className="font-semibold text-white">{label}</p>

      <ul className="mt-4 space-y-6">
        {entries.map((entry) => (
          <EntryListItem key={entry._id} entry={entry} />
        ))}
      </ul>
    </div>
  ) : null;
}

function EntryListItem({ entry }) {
  let { session } = useLoaderData();

  return (
    <li className="group leading-7">
      {entry.text}

      {session.isAdmin && (
        <Link
          to={`/entries/${entry._id}/edit`}
          className="ml-2 text-sky-500 opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
      )}
    </li>
  );
}
