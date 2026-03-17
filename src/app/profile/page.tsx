"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Mail,
  MapPin,
  PenSquare,
  User,
  Facebook,
  Youtube,
  Linkedin,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditRecruiterModal from "@/components/profile/edit-recruiter-modal";
import EditCompanyModal from "@/components/profile/edit-company-modal";
import SkillsManager from "@/components/profile/skills-manager";
import LinksManager from "@/components/profile/links-manager";
import ActiveSearchesManager from "@/components/profile/active-searches-manager";
import InsightsManager from "@/components/profile/insights-manager";
import { profileApi, type UserProfile } from "@/lib/profile-api";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isSearchesDialogOpen, setIsSearchesDialogOpen] = useState(false);
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await profileApi.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUser();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Please log in to view your profile</h2>
        <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
      </div>
    );
  }

  const isRecruiter = user.role === "RECRUITER" && user.recruiterProfile;
  const isCompany = user.role === "COMPANY" && user.company;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg text-slate-900 mb-6">Details</h2>

            <div className="space-y-5">
              {isRecruiter && (
                <>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Title</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.recruiterProfile?.title || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tagline</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.recruiterProfile?.tagline || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Experience</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.recruiterProfile?.yearsExperience} Years
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Location</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.recruiterProfile?.location || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Rating</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.recruiterProfile?.rating || "0"} / 5.0
                    </p>
                  </div>
                </>
              )}

              {isCompany && (
                <>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Size</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.company?.size || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Location</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.company?.location || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Industry</span>
                    <p className="text-sm font-medium text-slate-900">
                      {user.company?.industry || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Website</span>
                    {user.company?.website ? (
                      <a 
                        href={user.company.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline break-all"
                      >
                        {user.company.website}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-slate-900">—</p>
                    )}
                  </div>
                </>
              )}
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
                    const imgUrl = isRecruiter ? user.recruiterProfile?.photoUrl : isCompany ? user.company?.logoUrl : null;
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
                    {isCompany ? user.company?.name : user.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </span>
                    {user.company?.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {user.company?.location}
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
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">
                {isCompany ? "About Company" : "About"}
              </h2>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed">
              {isRecruiter 
                ? user.recruiterProfile?.bio || "No bio added yet."
                : user.company?.description || "No description added yet."}
            </p>
          </div>

          {/* RECRUITER PROFILE SECTIONS */}
          {isRecruiter && user?.recruiterProfile && (
            <>
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
                {user.recruiterProfile.tags && user.recruiterProfile.tags.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      user.recruiterProfile.tags.reduce((acc, tag) => {
                        const type = tag.skill.type || "Other";
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(tag);
                        return acc;
                      }, {} as Record<string, typeof user.recruiterProfile.tags>)
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
                {user.recruiterProfile.links && user.recruiterProfile.links.length > 0 ? (
                  <div className="space-y-2">
                    {user.recruiterProfile.links.map(link => (
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
                {user.recruiterProfile.activeSearches && user.recruiterProfile.activeSearches.length > 0 ? (
                  <div className="space-y-2">
                    {user.recruiterProfile.activeSearches.map(search => (
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
              {user.recruiterProfile.insights && user.recruiterProfile.insights.filter(i => i.status === "PUBLISHED").length > 0 && (
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
                    {user.recruiterProfile.insights
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
            </>
          )}

          {/* COMPANY SKILLS SECTION */}
          {isCompany && user?.company && (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-900">Company Skills & Focus</h2>
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
              {user.company.tags && user.company.tags.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    user.company.tags.reduce((acc, tag) => {
                      const type = tag.skill.type || "Other";
                      if (!acc[type]) acc[type] = [];
                      acc[type].push(tag);
                      return acc;
                    }, {} as Record<string, typeof user.company.tags>)
                  ).map(([type, tags]) => (
                    <div key={type}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{type}</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag.id} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
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
          )}

        </div>
      </div>

      {isRecruiter && user?.recruiterProfile && (
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Recruiter Profile</DialogTitle>
            </DialogHeader>
            <EditRecruiterModal 
              profile={user.recruiterProfile} 
              onClose={() => setIsEditProfileOpen(false)} 
              onSuccess={fetchUser} 
            />
          </DialogContent>
        </Dialog>
      )}

      {isCompany && user?.company && (
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company Profile</DialogTitle>
            </DialogHeader>
            <EditCompanyModal 
              profile={user.company} 
              onClose={() => setIsEditProfileOpen(false)} 
              onSuccess={fetchUser} 
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Skills Dialog */}
      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Skills</DialogTitle>
          </DialogHeader>
          {isRecruiter && user?.recruiterProfile && (
            <SkillsManager
              recruiterId={user.recruiterProfile.id}
              currentSkills={(user.recruiterProfile.tags || []).map((tag) => tag.skill)}
              isEditing={true}
              onSave={() => {
                setIsSkillsDialogOpen(false);
                fetchUser();
              }}
            />
          )}
          {isCompany && user?.company && (
            <SkillsManager
              companyId={user.company.id}
              currentSkills={(user.company.tags || []).map((tag) => tag.skill)}
              isEditing={true}
              onSave={() => {
                setIsSkillsDialogOpen(false);
                fetchUser();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Links & Contacts</DialogTitle>
          </DialogHeader>
          {isRecruiter && user?.recruiterProfile && (
            <LinksManager 
              links={user.recruiterProfile.links || []}
              recruiterId={user.recruiterProfile.id}
              isEditing={true}
              onLinksChange={() => {
                setIsLinksDialogOpen(false);
                fetchUser();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Active Searches Dialog */}
      <Dialog open={isSearchesDialogOpen} onOpenChange={setIsSearchesDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Active Job Searches</DialogTitle>
          </DialogHeader>
          {isRecruiter && user?.recruiterProfile && (
            <ActiveSearchesManager 
              searches={user.recruiterProfile.activeSearches || []}
              recruiterId={user.recruiterProfile.id}
              isEditing={true}
              onSearchesChange={() => {
                setIsSearchesDialogOpen(false);
                fetchUser();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Insights Dialog */}
      <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Insights & Content</DialogTitle>
          </DialogHeader>
          {isRecruiter && user?.recruiterProfile && (
            <InsightsManager 
              insights={user.recruiterProfile.insights || []}
              recruiterId={user.recruiterProfile.id}
              isEditing={true}
              onInsightsChange={() => {
                setIsInsightsDialogOpen(false);
                fetchUser();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Form Manager Dialog */}
      {/* Removed - Companies no longer manage form templates */}

    </main>
  );
}
