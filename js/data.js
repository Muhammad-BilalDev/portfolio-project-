/* ============================================================
   SITE DATA — this is the only file you need to edit.

   Everything on the page is read from the SITE object below.
   Add a project = add one object to SITE.projects. No HTML edits.

   Quick map of what lives where:
     SITE.identity   your name, role line, headline, intro
     SITE.tracks     the two things you offer
     SITE.projects   every build, in the order they should appear
     SITE.skills     skill groups, with an honest level on each
     SITE.note       the one build you want to talk about
     SITE.now        what you are working on right now
     SITE.contact    email and availability
     SITE.chatbot    n8n webhook URL for the chat panel
   ============================================================ */

var SITE = {

  /* ----------------------------------------------------------
     1. IDENTITY
     FILL THESE TWO IN: name and email (email is under SITE.contact).
     ---------------------------------------------------------- */
  identity: {
    name: "Bilal",                       // <-- put your real name here
    roleLine: "Front-end developer and automation builder",
    headline: [
      "Front-end builds,",
      "and the automation",
      "that runs behind them."
    ],
    intro: "I hand-code interfaces in HTML, CSS and Bootstrap, and I use n8n and prompt engineering to make the work behind them run on its own. Every build below links to the live version where one exists — open them and check.",
    location: "Pakistan, working remotely"
  },

  /* ----------------------------------------------------------
     2. THE TWO TRACKS — what someone can hire you for.
     ---------------------------------------------------------- */
  tracks: [
    {
      title: "Interfaces",
      body: "Responsive sites and dashboards written by hand in HTML and CSS, with Bootstrap when a project needs to move fast. Layouts that hold up on a phone, not just on the screen I built them on."
    },
    {
      title: "Automation",
      body: "n8n workflows and system prompts that carry a job from start to finish. I write the spec, wire the nodes, then try to break the thing before anyone else does."
    }
  ],

  /* ----------------------------------------------------------
     3. PROJECTS
     Order here = order on the page. featured: true gets the
     large panel at the top (keep only one featured).

     Fields:
       name      project title
       kind      short stack / type line
       status    "Live" or "No live link"
       url       live URL, or "" if there isn't one
       summary   one or two plain sentences, shown collapsed
       detail    array of { label, body } blocks, shown expanded
       stages    optional 4-step flow, only used on the featured build
     ---------------------------------------------------------- */
  projects: [
    {
      name: "Maintain IQ",
      kind: "IT and facility maintenance dashboard",
      status: "Live",
      // NOTE: if the bare root does not load the app, change this to
      // "https://maintain-iq-project.netlify.app/dashboard.html"
      url: "https://maintain-iq-project.netlify.app",
      featured: true,
      summary: "Staff report a defect against a piece of equipment, the ticket picks up a priority and an owner, a technician is dispatched, and the record closes with the fix attached. Assets, spare-part stock and open workload sit in the same view.",
      stages: ["Defect reported", "Ticket raised", "Technician dispatched", "Closed and logged"],
      detail: [
        {
          label: "What I built",
          body: "The whole product, not a screen of it: the asset and spare-part register, the defect form, the ticket queue with priority ordering, the dispatch step, and the closing record. The workload view answers the only question a facility manager actually asks — what is open, and who is on it."
        },
        {
          label: "The part that was hard",
          body: "Keeping one ticket consistent across four different views while it changes state. A ticket on the queue, on a technician's list, in the asset history and in the closed log is the same record, so every state change had to update all of them or the dashboard starts lying."
        },
        {
          label: "Stack",
          // Confirm this line is right before you share the site.
          body: "HTML, CSS and JavaScript. No framework and no build step — it deploys as static files."
        }
      ]
    },
    {
      name: "Portfolio site with an embedded AI assistant",
      kind: "HTML, CSS, JavaScript, n8n, Claude Code",
      status: "Live",
      url: "https://agentic-ai-portfolio.netlify.app",
      summary: "A portfolio with a chat assistant built into it. The assistant answers questions about my work, and it can only answer from a fixed project list — so it cannot invent a client, a job or a testimonial.",
      detail: [
        {
          label: "What I built",
          body: "The site itself, plus the n8n workflow and the system prompt behind the assistant. The project list is the assistant's only source of truth, which is what stops it filling gaps with things that sound plausible."
        },
        {
          label: "How I tested it",
          body: "Six versions of the prompt, each one written after the previous one failed a test. Version three told a visitor \"sure, I'll pass your email along\" — it had no way to pass anything along. I found that by writing prompts designed to make it lie, along with jailbreak and data-leak attempts, and closed the gaps one at a time."
        },
        {
          label: "A decision worth explaining",
          body: "I chose the larger model over the cheaper mini version, because the mini version failed the jailbreak tests. It cost more per message and it was the right call."
        }
      ]
    },
    {
      name: "Al-Mustafa Academy",
      kind: "HTML, CSS",
      status: "Live",
      url: "https://al-mustafa-academy-html-css.netlify.app",
      summary: "A multi-section site for an education academy — courses, faculty and admissions. Hand-written, no framework.",
      detail: [
        {
          label: "What I built",
          body: "Every page and every rule of CSS. The course and faculty sections repeat a lot, so the layout is built once and reused rather than copied and tweaked, which is what keeps the spacing consistent across the site."
        },
        {
          label: "Stack",
          body: "HTML and CSS only. Responsive from wide desktop down to phone."
        }
      ]
    },
    {
      name: "To-do list app",
      kind: "HTML, CSS, JavaScript",
      status: "Live",
      url: "https://todo-app-list-html-css-js.netlify.app",
      summary: "Add, complete and remove tasks, with the list rendered from state rather than patched in place.",
      detail: [
        {
          label: "What I built",
          body: "All of it. The useful lesson was rendering from a single array instead of adding and deleting DOM nodes by hand — the second approach falls apart the moment you add filtering."
        }
      ]
    },
    {
      name: "Calculator",
      kind: "HTML, CSS, JavaScript",
      status: "Live",
      url: "https://calculator-app-html-css-js.netlify.app",
      summary: "A working calculator with keyboard input and the chained-operation behaviour people expect from a real one.",
      detail: [
        {
          label: "What I built",
          body: "All of it. Most of the work was in the edge cases rather than the arithmetic: a second decimal point, an operator pressed twice, and equals pressed on an incomplete expression."
        }
      ]
    },
    {
      name: "Quiz app",
      kind: "HTML, CSS, JavaScript",
      status: "No live link",
      url: "",
      summary: "A multiple-choice quiz that scores as it goes, with questions held in an array so the quiz can be swapped without touching the markup.",
      detail: [
        {
          label: "What I built",
          body: "All of it. This is the build where separating data from markup first made sense to me — the questions are data, the page is a renderer."
        }
      ]
    },
    {
      name: "SaltnPepper clone",
      kind: "HTML, CSS",
      status: "Live",
      url: "https://saltnpepper-web-clone-html-css.netlify.app",
      summary: "A restaurant site rebuilt from the original as a layout exercise, hand-written in HTML and CSS.",
      detail: [
        {
          label: "Why this one exists",
          body: "Rebuilding a real commercial page from scratch is the fastest way to find out which parts of CSS you only think you understand. Copying a design you did not plan forces you to solve someone else's decisions."
        }
      ]
    },
    {
      name: "Bloom landing page, twice",
      kind: "HTML, CSS — then Bootstrap",
      status: "Live",
      url: "https://bloom-web-clone-with-bootstrap.netlify.app",
      summary: "The same landing page built two ways: once in hand-written CSS, then again in Bootstrap, to see what the framework actually saves and what it takes away. The Bootstrap version is the one that is live.",
      detail: [
        {
          label: "What I learned",
          body: "Bootstrap got the grid and the breakpoints out of the way in an afternoon. It also pulled the design towards its own defaults, and pulling it back cost more CSS than I expected. Now I pick per project instead of by habit."
        }
      ]
    }
  ],

  /* ----------------------------------------------------------
     4. SKILLS
     Levels are words, not bars or percentages. Use one of:
       "Using daily"  /  "Comfortable"  /  "Learning"
     "shown" should name a project on this page, so every claim
     has something a visitor can click.
     ---------------------------------------------------------- */
  skills: [
    {
      group: "Front-end",
      items: [
        { name: "HTML", level: "Using daily", note: "Semantic structure, accessible forms and landmarks.", shown: "Al-Mustafa Academy" },
        { name: "CSS", level: "Using daily", note: "Layout by hand — flexbox, grid, responsive breakpoints.", shown: "SaltnPepper clone" },
        { name: "Bootstrap", level: "Using daily", note: "Grid, components, and overriding it when the design needs it.", shown: "Bloom landing page, twice" },
        { name: "JavaScript", level: "Comfortable", note: "DOM work, events, state and dynamic rendering. No frameworks yet.", shown: "To-do list app" }
      ]
    },
    {
      group: "AI and automation",
      items: [
        { name: "Prompt engineering", level: "Using daily", note: "System prompts with hard constraints, tested against attempts to break them.", shown: "Portfolio site with an embedded AI assistant" },
        { name: "n8n", level: "Using daily", note: "Workflow design, webhooks, and wiring a model into a live site.", shown: "Portfolio site with an embedded AI assistant" },
        { name: "Spec-driven development", level: "Using daily", note: "Write the spec first, review every line of output against it.", shown: "Maintain IQ" },
        { name: "Agentic CLI tools", level: "Using daily", note: "Claude Code, OpenCode and Gemini CLI as part of a normal working day.", shown: "Maintain IQ" }
      ]
    },
    {
      group: "Learning now",
      items: [
        { name: "Python", level: "Learning", note: "Syntax and fundamentals. No shipped Python project yet.", shown: "" },
        { name: "JavaScript beyond the DOM", level: "Learning", note: "Async work, APIs and modules — the gap between my JS apps and a framework.", shown: "" }
      ]
    }
  ],

  /* ----------------------------------------------------------
     5. THE ONE BUILD WORTH EXPLAINING
     ---------------------------------------------------------- */
  note: {
    title: "Notes from one build",
    lead: "If you only ask me about one thing, ask about the chat assistant.",
    body: [
      "The first version worked, which is the problem with chat assistants — they always look like they work. So I stopped asking it questions I wanted answered and started asking questions designed to make it slip.",
      "Version three told a visitor I would pass their email along. Nothing in the workflow could pass anything along. It had not been given a boundary, so it invented a helpful-sounding one. That is the failure mode nobody notices until a real client is on the other end of it.",
      "Six versions later the project list is the only thing it can answer from, invented clients and testimonials are ruled out explicitly, and there is a clause for people who try to talk it out of its own instructions. I kept the test prompts. They are how I check any change I make to it."
    ]
  },

  /* ----------------------------------------------------------
     6. NOW — keep this current, it is the most human line here.
     ---------------------------------------------------------- */
  now: "Working through JavaScript past the DOM — async, APIs and modules — and starting Python properly rather than reading about it.",

  /* ----------------------------------------------------------
     7. CONTACT
     FILL IN: email.
     To add GitHub or LinkedIn later, fill in the URL below and the
     link appears on the page by itself. Leave it "" and it stays hidden.
     ---------------------------------------------------------- */
  contact: {
    email: "bilalworkdevs@gmail.com",              // <-- put your real email here
    availability: "Open to front-end roles and freelance builds, in Pakistan or remote.",
    github: "",
    linkedin: ""
  },

  /* ----------------------------------------------------------
     9. CHAT ASSISTANT
     Paste your n8n Production webhook URL between the quotes below
     to connect your live AI workflow.
     Leave it "" to use the built-in Smart Portfolio Assistant!
     (You can also set or test the webhook via the ⚙️ gear icon
     inside the chat window on the live page).
     ---------------------------------------------------------- */
  chatbot: {
    webhookUrl: "", // <-- Paste your n8n Production Webhook URL here!
    title: "Ask about my work",
    greeting: "Hi there! I am the portfolio assistant. Ask me anything about the projects, skills, or automations on this page.",
    placeholder: "Type a question or pick a topic..."
  }
};
