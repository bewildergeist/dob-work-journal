import { Link, useLoaderData } from "@remix-run/react";
import { format, startOfWeek, parseISO } from "date-fns";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";

/* ACTION --------------------------------------------------------- */
export async function action({ request }) {
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
export async function loader() {
  // We're using `lean` here to get plain objects instead of Mongoose documents
  // so we can map over them:
  // https://mongoosejs.com/docs/api/query.html#Query.prototype.lean()
  // We're calling `exec` to execute the query and return a promise:
  // https://mongoosejs.com/docs/promises.html#should-you-use-exec-with-await
  const entries = await mongoose.models.Entry.find().lean().exec();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

/* UI ------------------------------------------------------------- */
export default function Index() {
  const entries = useLoaderData();

  const entriesByWeek = entries.reduce((memo, entry) => {
    let sunday = startOfWeek(parseISO(entry.date));
    let sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
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
      <div className="my-8 border p-3">
        <p className="italic">Create a new entry</p>
        <EntryForm />
      </div>

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryListItem({ entry }) {
  return (
    <li className="group">
      {entry.text}

      <Link
        to={`/entries/${entry._id}/edit`}
        className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
