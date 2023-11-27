import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Input } from "./components/ui/input";

function App() {
  const [code, setCode] = useState("");
  const story = useQuery(api.myFunctions.getStory, code ? { code } : "skip");
  // const start = useMutation(api.myFunctions.start);

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">Story Line</h1>
      <h2>
        Code:
        <Input onChange={(e) => setCode(e.target.value)} />
      </h2>
      {story && story.map((item) => <p key={item}>{item}</p>)}
    </main>
  );
}

export default App;
