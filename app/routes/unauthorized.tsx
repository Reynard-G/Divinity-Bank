import {
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Unauthorized • Divinity" },
    { name: "description", content: "Whatcha doing here lil bro? You ain\'t supposed to be here! 😡" },
  ];
};

export default function Unauthorized() {
  return (
    <main className="relative h-dvh">
      test
    </main>
  );
}
