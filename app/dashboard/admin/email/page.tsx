import { LEAGUES } from "@/lib/events";
import { SendEmailForm } from "./SendEmailForm";

export default function AdminEmailPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">Send email</h2>
      <SendEmailForm leagues={LEAGUES} />
    </div>
  );
}
