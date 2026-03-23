"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  PenSquare,
  LogOut,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecruiterManager from "@/components/profile/recruiter-manager";
import SkillsManager from "@/components/profile/skills-manager";
import LinksManager from "@/components/profile/links-manager";
import InsightsManager from "@/components/profile/insights-manager";
import { type UserProfile } from "@/lib/profile-api";
import ActiveSearches from "@/components/profile/active-searches";

interface RecruiterProfileProps {
  user: UserProfile;
  onProfileUpdated: () => Promise<void>;
}

export default function RecruiterProfile({ user, onProfileUpdated }: RecruiterProfileProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isSearchesDialogOpen, setIsSearchesDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);

  const recruiterProfile = user.recruiterProfile!;

  const handleProfileUpdated = async () => {
    setIsEditProfileOpen(false);
    await onProfileUpdated();
  };

  const handleSkillsUpdated = async () => {
    setIsSkillsDialogOpen(false);
    await onProfileUpdated();
  };

  const handleLinksUpdated = async () => {
    setIsLinksDialogOpen(false);
    await onProfileUpdated();
  };

  const handleSearchesUpdated = async () => {
    setIsSearchesDialogOpen(false);
    await onProfileUpdated();
  };

  const handleInsightsUpdated = async () => {
    setIsInsightsDialogOpen(false);
    await onProfileUpdated();
  };

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      <div className="flex flex-col lg:flex-row gap-6 px-28">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg text-slate-900 mb-6">Details</h2>

            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Title</span>
                <p className="text-sm font-medium text-slate-900">
                  {recruiterProfile?.title || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tagline</span>
                <p className="text-sm font-medium text-slate-900">
                  {recruiterProfile?.tagline || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Experience</span>
                <p className="text-sm font-medium text-slate-900">
                  {recruiterProfile?.yearsExperience} Years
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Location</span>
                <p className="text-sm font-medium text-slate-900">
                  {recruiterProfile?.location || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Rating</span>
                <p className="text-sm font-medium text-slate-900">
                  {recruiterProfile?.rating || "0"} / 5.0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-6">
          
          {/* HEADER ROW */}
          <div className="flex flex-col xl:flex-row gap-6">
            {/* User Main Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex-1 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                <div className="relative w-24 h-24 sm:w-25 sm:h-25 rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {(() => {
                    const imgUrl = recruiterProfile?.photoUrl;
                    if (imgUrl) {
                      return (
                        <Image
                          src={imgUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('fallback-icon-active');
                          }}
                        />
                      );
                    }
                    return <User className="w-12 h-12 text-slate-400" />;
                  })()}
                  <User className="w-12 h-12 text-slate-400 hidden absolute fallback-icon" />
                  <style jsx>{`
                    .fallback-icon-active .fallback-icon {
                      display: block;
                    }
                  `}</style>
                </div>
                
                <div className="text-center sm:text-left space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {user.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </span>
                    {recruiterProfile?.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {recruiterProfile?.location}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Joined: {new Date(user.createdAt).toLocaleDateString("en-CA")} &nbsp; | &nbsp; Lambda ID: {user.id.split('-')[0]}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:self-start">
                <Button 
                  onClick={() => setIsEditProfileOpen(true)}
                  variant="outline" 
                  className="rounded-full gap-2 font-medium border-slate-200"
                >
                  <PenSquare className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="ghost"
                  className="rounded-full gap-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">About</h2>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed">
              {recruiterProfile?.bio || "No bio added yet."}
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Skills & Expertise</h2>
              <Button
                onClick={() => setIsSkillsDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
              >
                <PenSquare className="w-4 h-4" />
                Edit
              </Button>
            </div>
            {recruiterProfile.tags && recruiterProfile.tags.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(
                  recruiterProfile.tags.reduce((acc, tag) => {
                    const type = tag.skill.type || "Other";
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(tag);
                    return acc;
                  }, {} as Record<string, typeof recruiterProfile.tags>)
                ).map(([type, tags]) => (
                  <div key={type}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{type}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag.id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {tag.skill.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added yet.</p>
            )}
          </div>

          {/* Links Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Links & Contacts</h2>
              <Button
                onClick={() => setIsLinksDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
              >
                <PenSquare className="w-4 h-4" />
                Edit
              </Button>
            </div>
            {recruiterProfile.links && recruiterProfile.links.length > 0 ? (
              <div className="space-y-2">
                {recruiterProfile.links.map(link => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-blue-600 hover:underline break-all"
                  >
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No links added yet.</p>
            )}
          </div>

          {/* Active Searches Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Active Job Searches</h2>
              <Button
                onClick={() => setIsSearchesDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
              >
                <PenSquare className="w-4 h-4" />
                Edit
              </Button>
            </div>
            {recruiterProfile.activeSearches && recruiterProfile.activeSearches.length > 0 ? (
              <div className="space-y-2">
                {recruiterProfile.activeSearches.map(search => (
                  <div key={search.id} className="border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-sm text-slate-900">{search.title}</p>
                    {search.location && <p className="text-xs text-slate-600">{search.location}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active searches yet.</p>
            )}
          </div>

          {/* Insights Section */}
          {recruiterProfile.insights && recruiterProfile.insights.filter(i => i.status === "PUBLISHED").length > 0 && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-900">Insights & Content</h2>
                <Button
                  onClick={() => setIsInsightsDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <PenSquare className="w-4 h-4" />
                  Edit
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {recruiterProfile.insights
                  .filter(i => i.status === "PUBLISHED")
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map(insight => (
                    <div
                      key={insight.id}
                      className="w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                        <iframe
                          src={insight.mediaUrl}
                          title={insight.title}
                          className="h-full w-full"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          frameBorder="0"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recruiter Profile</DialogTitle>
          </DialogHeader>
          <RecruiterManager 
            profile={recruiterProfile} 
            onClose={() => setIsEditProfileOpen(false)} 
            onSuccess={handleProfileUpdated} 
          />
        </DialogContent>
      </Dialog>

      {/* Skills Dialog */}
      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Skills</DialogTitle>
          </DialogHeader>
          <SkillsManager
            recruiterId={recruiterProfile.id}
            currentSkills={(recruiterProfile.tags || []).map((tag) => tag.skill)}
            isEditing={true}
            onSave={handleSkillsUpdated}
          />
        </DialogContent>
      </Dialog>

      {/* Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Links & Contacts</DialogTitle>
          </DialogHeader>
          <LinksManager 
            links={recruiterProfile.links || []}
            recruiterId={recruiterProfile.id}
            isEditing={true}
            onLinksChange={handleLinksUpdated}
          />
        </DialogContent>
      </Dialog>

      {/* Active Searches Dialog */}
      <Dialog open={isSearchesDialogOpen} onOpenChange={setIsSearchesDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Active Job Searches</DialogTitle>
          </DialogHeader>
          <ActiveSearches 
            searches={recruiterProfile.activeSearches || []}
            recruiterId={recruiterProfile.id}
            isEditing={true}
            onSearchesChange={handleSearchesUpdated}
          />
        </DialogContent>
      </Dialog>

      {/* Insights Dialog */}
      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Insights & Content</DialogTitle>
          </DialogHeader>
          <InsightsManager 
            insights={recruiterProfile.insights || []}
            recruiterId={recruiterProfile.id}
            isEditing={true}
            onInsightsChange={handleInsightsUpdated}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
