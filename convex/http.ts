import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { ConvexError } from "convex/values";

const http = httpRouter();
http.route({
  path: "/start",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const phone = await req.text();
    console.log({ phone });
    const code = await ctx.runMutation(api.myFunctions.start, { phone });
    return new Response(code, {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }),
});
http.route({
  path: "/join",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    console.log({ body });
    const code = await ctx.runMutation(api.myFunctions.join, body);
    return new Response(code, {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }),
});
http.route({
  path: "/end",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const phone = await req.text();
    console.log({ phone });
    const resp = await ctx.runMutation(api.myFunctions.end, { phone });
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }),
});

http.route({
  path: "/add",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    console.log({ body });
    const resp = await ctx.runMutation(api.myFunctions.addLine, body);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  }),
});

http.route({
  path: "/view",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    // get the code from the url parameter
    const code = url.searchParams.get("code");
    console.log({ url, code });
    if (!code) {
      throw new ConvexError("no code found");
    }

    const lines = await ctx.runQuery(api.myFunctions.getStory, { code });
    const story = lines && lines.map((line) => `<p>${line}</p>`).join("\n");
    return new Response(
      `
		<html>
		<body>
		<h1>Your Story</h1>
		${story}
		</body>
		</html>`,
      {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }
    );
  }),
});

export default http;
