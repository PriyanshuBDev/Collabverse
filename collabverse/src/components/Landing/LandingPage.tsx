"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  FolderKanban,
  LockKeyhole,
  LucideIcon,
  MessageCircle,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
type prop = {
  icon: LucideIcon;
  title: string;
  text: string;
};
const people = [
  {
    name: "Alex Morgan",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
  },
  {
    name: "Jordan Lee",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
  },
  {
    name: "Maya Chen",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=96&h=96&fit=crop&crop=faces",
  },
  {
    name: "Sam Rivera",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces",
  },
  {
    name: "Priya Shah",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

function Avatar({
  person,
  size = "h-8 w-8",
}: {
  person: (typeof people)[number];
  size?: string;
}) {
  return (
    <Image
      src={person.image}
      alt={person.name}
      width={64}
      height={64}
      unoptimized
      className={`${size} rounded-full object-cover ring-2 ring-[#111511]`}
    />
  );
}
type personProp = {
  name: string;
  image: string;
};
function AvatarStack({
  members = people.slice(0, 3),
  size = "h-8 w-8",
}: {
  members?: (typeof people)[number][];
  size?: string;
}) {
  return (
    <div className="flex -space-x-2">
      {members.map((person: personProp) => (
        <Avatar key={person.name} person={person} size={size} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
      <span className="h-px w-6 bg-emerald-400" />
      {children}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.article
      variants={reveal}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b211d] to-[#141815] p-6"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
        <Icon size={19} />
      </div>
      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
        {label}
      </p>
      <h3 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      {children}
    </motion.article>
  );
}

function WorkspacePreview() {
  return (
    <motion.div variants={reveal} className="relative w-full">
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.01 }}
        className="relative"
      >
        <div className="absolute -inset-5 rounded-[2rem] bg-emerald-500/10 blur-3xl" />

        <Image
          src="/workspace-homepage.png"
          alt="CollabVerse workspace showing projects, tasks, team members, and Flowspace"
          width={1868}
          height={984}
          priority
          className="relative h-auto w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/60"
        />
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-6 left-3 z-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#1b241f]/95 px-4 py-3 shadow-xl shadow-black/40 sm:flex"
      >
        <AvatarStack members={[people[1], people[2]]} size="h-8 w-8" />
        <div>
          <p className="text-sm font-semibold text-white">Team in sync</p>
          <p className="mt-0.5 text-xs text-white/55">4 people online</p>
        </div>
        <span className="ml-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -right-15 top-20 z-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#1b241f]/95 px-4 py-3 shadow-xl shadow-black/40 md:flex"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300/10 text-violet-200">
          <MessageCircle size={17} />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">New message</p>
          <p className="mt-0.5 text-xs text-white/55">
            “Looks great, shipping it!”
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FlowspaceSection() {
  return (
    <section
      id="flowspace"
      className="border-y border-white/5 bg-[#111713] px-5 py-24 sm:px-8 lg:px-10"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={reveal}>
            <SectionLabel>A room for the in-between</SectionLabel>
          </motion.div>
          <motion.h2
            variants={reveal}
            className="text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl"
          >
            Work has a place.
            <br />
            <span className="text-white/40">So does being together.</span>
          </motion.h2>
          <motion.p
            variants={reveal}
            className="mt-5 max-w-xl text-base leading-7 text-white/60"
          >
            Flowspace is your team’s virtual hangout. Drop in to think out loud,
            get unstuck, or catch up—without the meeting link or calendar
            shuffle.
          </motion.p>

          <motion.div variants={reveal} className="mt-8 space-y-5">
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Users size={17} />
              </span>
              <div>
                <h3 className="font-medium text-white">See who’s around</h3>
                <p className="mt-1 text-sm text-white/55">
                  Find teammates and join them in a shared space.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Video size={17} />
              </span>
              <div>
                <h3 className="font-medium text-white">Talk and share</h3>
                <p className="mt-1 text-sm text-white/55">
                  Move from a quick hello to a call or screen share.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Sparkles size={17} />
              </span>
              <div>
                <h3 className="font-medium text-white">Make it your space</h3>
                <p className="mt-1 text-sm text-white/55">
                  Personalize your avatar and show up as yourself.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.a
            variants={reveal}
            href="#get-started"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/10"
          >
            Explore Flowspace <ArrowRight size={16} />
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
          className="relative min-h-[390px] overflow-hidden rounded-3xl border border-emerald-200/10 bg-gradient-to-br from-emerald-950 via-[#17251d] to-[#18201b] p-6 shadow-2xl shadow-black/30"
        >
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex items-center justify-between border-b border-white/10 pb-4 text-xs font-semibold tracking-widest text-white/70">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              FLOWSPACE
              <span className="font-normal tracking-normal text-white/40">
                · Studio lounge
              </span>
            </span>
            <span className="text-white/50">•••</span>
          </div>

          <div className="relative mt-8 flex h-56 items-end justify-center">
            <div className="absolute bottom-3 h-24 w-4/5 rounded-[50%] border border-emerald-200/10 bg-emerald-300/5" />
            <div className="absolute bottom-20 flex h-16 w-1/2 items-end gap-2 rounded-2xl border border-emerald-200/20 bg-emerald-800/80 p-2 shadow-xl">
              <div className="h-9 flex-1 rounded-lg bg-white/10" />
              <div className="h-9 flex-1 rounded-lg bg-white/10" />
              <div className="h-9 flex-1 rounded-lg bg-white/10" />
            </div>
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-24 left-[18%] flex flex-col items-center gap-2"
            >
              <Avatar person={people[2]} size="h-11 w-11" />
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white">
                Maya
              </span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-24 right-[18%] flex flex-col items-center gap-2"
            >
              <Avatar person={people[1]} size="h-11 w-11" />
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white">
                Jordan
              </span>
            </motion.div>
            <div className="absolute right-[44%] top-1 flex flex-col items-center gap-2">
              <Avatar person={people[4]} size="h-11 w-11" />
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white">
                Priya
              </span>
            </div>
          </div>

          <div className="relative mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <AvatarStack
              members={[people[2], people[1], people[4]]}
              size="h-7 w-7"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                Quick sync in the lounge
              </p>
              <p className="mt-1 text-xs text-white/50">
                3 teammates · just now
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-emerald-950">
              <Video size={17} />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-hidden bg-[#101210] text-[#f3f5f3]">
        <header className="absolute inset-x-0 top-0 z-20 border-b border-white/5 bg-[#101210]/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
            <a href="#top" className="flex items-center gap-2">
              <Image
                src="/collabverseLogo.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight">
                Collab<span className="text-emerald-400">Verse</span>
              </span>
            </a>

            <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
              <a className="transition hover:text-emerald-200" href="#platform">
                Platform
              </a>
              <a
                className="transition hover:text-emerald-200"
                href="#flowspace"
              >
                Flowspace
              </a>
              <a className="transition hover:text-emerald-200" href="#security">
                Security
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/auth/signin"
                className="hidden text-sm text-white/70 transition hover:text-white sm:block"
              >
                Log in
              </a>
              <a
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
              >
                Get started <ArrowUpRight size={16} />
              </a>
            </div>
          </nav>
        </header>

        <main id="top">
          <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_75%_35%,rgba(7,122,79,0.2),transparent_45%)] px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(181,232,192,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(181,232,192,0.035)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]"
            >
              <div>
                <motion.p
                  variants={reveal}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-2 text-xs font-medium text-emerald-100"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />A
                  shared space for your team
                </motion.p>
                <motion.h1
                  variants={reveal}
                  className="text-5xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-6xl lg:text-7xl"
                >
                  Work moves
                  <br />
                  better{" "}
                  <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                    together.
                  </span>
                </motion.h1>
                <motion.p
                  variants={reveal}
                  className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg"
                >
                  Projects, conversations, and your team’s shared space—all
                  connected in one secure workspace built for the way you work.
                </motion.p>
                <motion.div
                  variants={reveal}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <a
                    id="get-started"
                    href="#"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                  >
                    Bring your team in <ArrowRight size={16} />
                  </a>
                  <a
                    href="#platform"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5"
                  >
                    Take a look <ArrowDownRight size={16} />
                  </a>
                </motion.div>
                <motion.div
                  variants={reveal}
                  className="mt-7 flex items-center gap-3 text-sm text-white/55"
                >
                  <AvatarStack members={people} />
                  <span>Make good work feel more connected.</span>
                </motion.div>
              </div>

              <WorkspacePreview />
            </motion.div>
          </section>

          <section className="border-y border-white/5 bg-[#131713] px-5 py-5 sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-white/55">
                One workspace. Every part of working together.
              </p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-white/70">
                <span className="flex items-center gap-2">
                  <FolderKanban size={15} className="text-emerald-300" />
                  Projects
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={15} className="text-emerald-300" />
                  Conversations
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-emerald-300" />
                  Flowspace
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-300" />
                  Managed access
                </span>
              </div>
            </div>
          </section>

          <section id="platform" className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="max-w-2xl"
              >
                <motion.div variants={reveal}>
                  <SectionLabel>One connected workspace</SectionLabel>
                </motion.div>
                <motion.h2
                  variants={reveal}
                  className="text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl"
                >
                  A clearer view of
                  <br />
                  <span className="text-white/40">everything moving.</span>
                </motion.h2>
                <motion.p
                  variants={reveal}
                  className="mt-5 max-w-xl text-base leading-7 text-white/60"
                >
                  Keep the details close and the team connected. From a task’s
                  first comment to the project’s final handoff, your work stays
                  in context.
                </motion.p>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="mt-12 grid gap-4 md:grid-cols-2"
              >
                <FeatureCard
                  icon={FolderKanban}
                  label="Plan and follow through"
                  title="Projects with room to breathe"
                  description="See your work as a board, table, or calendar. Filter tasks by due date, priority, status, teammate, and project."
                >
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
                    {["Board", "Table", "Calendar"].map((view: string) => (
                      <span
                        key={view}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                      >
                        {view}
                      </span>
                    ))}
                  </div>
                </FeatureCard>

                <FeatureCard
                  icon={MessageCircle}
                  label="Keep the conversation close"
                  title="Talk where the work happens"
                  description="Message one person or a group, share files and media, then jump into voice or video without losing the thread."
                >
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <Avatar person={people[2]} />
                    <div>
                      <p className="text-sm font-semibold">Maya Chen</p>
                      <p className="text-xs text-white/55">
                        Looks great — I left a few notes
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-white/40">now</span>
                  </div>
                </FeatureCard>

                <FeatureCard
                  icon={CalendarDays}
                  label="Understand the pace"
                  title="See the whole team’s load"
                  description="Get useful signals from project summaries, priority views, workflow progress, and team workload."
                >
                  <div className="mt-6 flex h-12 items-end gap-2">
                    {[35, 55, 46, 75, 58, 90, 67, 82, 62, 94].map(
                      (height: number, index: number) => (
                        <span
                          key={index}
                          style={{ height: `${height}%` }}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-700 to-emerald-300/80"
                        />
                      ),
                    )}
                  </div>
                </FeatureCard>

                <FeatureCard
                  icon={Paperclip}
                  label="Keep every detail"
                  title="The full story travels with a task"
                  description="Comments, attachments, decisions, and an activity history stay beside the work."
                >
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <Avatar person={people[0]} size="h-7 w-7" />
                    <p className="text-xs text-white/65">
                      Alex moved a task to In progress
                    </p>
                    <Check size={15} className="ml-auto text-emerald-300" />
                  </div>
                </FeatureCard>
              </motion.div>
            </div>
          </section>

          <FlowspaceSection />

          <section id="security" className="px-5 py-16 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease }}
              className="mx-auto grid max-w-7xl gap-10 rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-[#18211b] to-[#121713] p-6 sm:p-10 lg:grid-cols-2 lg:items-center"
            >
              <div>
                <SectionLabel>Designed for team trust</SectionLabel>
                <h2 className="text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">
                  Your workspace.
                  <br />
                  <span className="text-white/40">
                    Your rules for who&apos;s in.
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
                  Role-based permissions, reviewed join requests, and a clear
                  activity trail help your team understand and manage access.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <AvatarStack members={people} />
                  <div>
                    <p className="text-sm font-semibold">
                      18 people in Northstar Studio
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Access is managed by workspace roles
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: LockKeyhole,
                    title: "Roles with clear boundaries",
                    text: "Set access for workspace, project, and task work.",
                  },
                  {
                    icon: Users,
                    title: "Invites you can review",
                    text: "Welcome people by link or username with approval.",
                  },
                  {
                    icon: CheckCheck,
                    title: "Activity with a clear trail",
                    text: "See changes and contributions as work moves forward.",
                  },
                ].map(({ icon: Icon, title, text }: prop) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-white/55">
                        {text}
                      </p>
                    </div>
                    <Check
                      size={16}
                      className="ml-auto shrink-0 text-emerald-300"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="px-5 pb-24 pt-12 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease }}
              className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-300 p-7 text-emerald-950 sm:p-10 lg:flex-row lg:items-center"
            >
              <div>
                <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-950/75">
                  <span className="h-px w-6 bg-emerald-950/60" />
                  Make room for better work
                </p>

                <h2 className="text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">
                  Bring your team
                  <br />
                  into the same space.
                </h2>

                <p className="mt-4 text-sm text-emerald-950/75">
                  Projects and people move better when they move together.
                </p>
              </div>

              <a
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-emerald-300 to-emerald-600 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Get started with CollabVerse <ArrowRight size={16} />
              </a>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-white/5 px-5 py-7 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <a href="#top" className="flex items-center gap-2">
              <Image
                src="/collabverseLogo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold tracking-tight">
                Collab<span className="text-emerald-400">Verse</span>
              </span>
            </a>
            <p className="text-sm text-white/50">
              One workspace for all the ways you work together.
            </p>
            <p className="text-xs text-white/40">© 2026 CollabVerse</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
