import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const story = useQuery(api.myFunctions.getStory, code ? { code } : "skip");
  const start = useMutation(api.myFunctions.start);

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">Story Line</h1>
      {code && <h2>{code}</h2>}
      <p>
        <Button
          onClick={async () => {
            const phone = prompt("Enter a phone number:");
            if (phone === null) return;
            const code = await start({ phone });
            setCode(code);
          }}
        >
          Add a random number
        </Button>
      </p>
      {story && story.map((item) => <p key={item}>{item}</p>)}
    </main>
  );
}

export default App;
