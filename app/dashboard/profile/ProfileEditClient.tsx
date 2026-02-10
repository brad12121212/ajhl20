"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProfilePictureUrl } from "@/lib/profile-picture";

type Props = {
  nickname: string | null;
  email: string;
  phone: string | null;
  jerseyNumber: string | null;
  secondaryJerseyNumber: string | null;
  thirdJerseyPreference: string | null;
  position: string | null;
  bio: string | null;
  usaHockey: string | null;
  profilePictureUrl: string | null;
  showContactToTeam: boolean;
};

export function ProfileEditClient({
  nickname,
  email,
  phone,
  jerseyNumber,
  secondaryJerseyNumber,
  thirdJerseyPreference,
  position,
  bio,
  usaHockey,
  profilePictureUrl,
  showContactToTeam,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [form, setForm] = useState({
    nickname: nickname ?? "",
    email: email ?? "",
    phone: phone ?? "",
    jerseyNumber: jerseyNumber ?? "",
    secondaryJerseyNumber: secondaryJerseyNumber ?? "",
    thirdJerseyPreference: thirdJerseyPreference ?? "",
    position: position ?? "",
    bio: bio ?? "",
    usaHockey: usaHockey ?? "",
    profilePictureUrl: profilePictureUrl ?? "",
    showContactToTeam: showContactToTeam ?? true,
  });

  async function handlePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPicture(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/users/profile-picture", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, profilePictureUrl: data.url }));
        setMessage("Picture uploaded. Click Save to update your profile.");
      } else {
        setMessage(data.error || "Upload failed.");
      }
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname.trim() || null,
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          jerseyNumber: form.jerseyNumber.trim() || null,
          secondaryJerseyNumber: form.secondaryJerseyNumber.trim() || null,
          thirdJerseyPreference: form.thirdJerseyPreference.trim() || null,
          position: form.position.trim() || null,
          bio: form.bio.trim() || null,
          usaHockey: form.usaHockey.trim() || null,
          profilePictureUrl: form.profilePictureUrl.trim() || null,
          showContactToTeam: form.showContactToTeam,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Saved.");
        router.refresh();
      } else {
        setMessage(data.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
      <h2 className="text-sm font-medium text-zinc-900">Edit profile</h2>
      <p className="mt-1 text-xs text-zinc-500">Display name, contact, and player info. Contact can be shown to captains/teammates.</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs text-zinc-500">Profile picture</label>
          <div className="mt-1 flex items-center gap-3">
            <img
              src={getProfilePictureUrl(form.profilePictureUrl)}
              alt="Profile"
              className="h-20 w-20 rounded-full border-2 border-zinc-200 object-cover"
            />
            <label className="cursor-pointer rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              {uploadingPicture ? "Uploading…" : form.profilePictureUrl ? "Change" : "Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePictureUpload}
                disabled={uploadingPicture}
              />
            </label>
            {form.profilePictureUrl && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, profilePictureUrl: "" }))}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Display name (nickname)</label>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Phone (on file)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Preferred jersey number</label>
          <input
            type="text"
            value={form.jerseyNumber}
            onChange={(e) => setForm((f) => ({ ...f, jerseyNumber: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="e.g. 7"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Secondary jersey number</label>
          <input
            type="text"
            value={form.secondaryJerseyNumber}
            onChange={(e) => setForm((f) => ({ ...f, secondaryJerseyNumber: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="e.g. 17"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Third jersey preference</label>
          <input
            type="text"
            value={form.thirdJerseyPreference}
            onChange={(e) => setForm((f) => ({ ...f, thirdJerseyPreference: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="e.g. any dark, 30-39"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Position</label>
          <select
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="Forward">Forward</option>
            <option value="Defense">Defense</option>
            <option value="Goalie">Goalie</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500">USA Hockey number</label>
          <input
            type="text"
            value={form.usaHockey}
            onChange={(e) => setForm((f) => ({ ...f, usaHockey: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Short bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            rows={3}
            placeholder="Optional"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showContactToTeam"
            checked={form.showContactToTeam}
            onChange={(e) => setForm((f) => ({ ...f, showContactToTeam: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <label htmlFor="showContactToTeam" className="text-sm text-zinc-700">
            Show my email and phone to captains and teammates (e.g. on roster exports)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {message && <span className="text-sm text-zinc-600">{message}</span>}
        </div>
      </div>
    </div>
  );
}
