"use client"

import { motion } from "framer-motion"
import {
  ExternalLink,
  Calendar,
  Pizza,
  Heart,
  GraduationCap,
  PenTool,
  Globe,
  BookOpen,
  Building,
  Smartphone,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProjectsSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const projects = [
    {
      title: "Pencraft.wiki",
      description:
        "Full-featured blogging platform with approved domain, hosting, database support, and integrated ad monetization system.",
      tech: ["Laravel", "Database", "Ad Integration", "Domain Management"],
      features: ["Full blogging system", "Ad monetization", "User management", "SEO optimization"],
      icon: Globe,
      gradient: "from-indigo-600 to-purple-600",
      liveLink: "https://pencraft.wiki",
      createdAt: "Live Production",
    },
    {
      title: "BlogHub Platform",
      description:
        "Complete blogging solution with approved domain, hosting, database support, and revenue generation through advertisements.",
      tech: ["Laravel", "Database", "Ad Networks", "Content Management"],
      features: ["Content management", "Ad revenue system", "User analytics", "Mobile responsive"],
      icon: BookOpen,
      gradient: "from-cyan-600 to-blue-600",
      liveLink: "#",
      createdAt: "Live Production",
    },
    {
      title: "Munshiin",
      description:
        "Collaborative project with USA-based team, providing innovative solutions for digital management and organization.",
      tech: ["JavaScript", "React", "API Integration", "Responsive Design"],
      features: ["International collaboration", "Custom solutions", "User dashboard", "Data management"],
      icon: Building,
      gradient: "from-blue-600 to-teal-600",
      liveLink: "#",
      createdAt: "USA Collaboration",
    },
    {
      title: "Fonespot",
      description:
        "Mobile-focused platform developed in collaboration with USA team, offering telecommunications solutions and services.",
      tech: ["React Native", "Mobile Development", "API", "User Authentication"],
      features: ["Cross-platform", "Telecommunications", "User profiles", "Service integration"],
      icon: Smartphone,
      gradient: "from-green-600 to-blue-600",
      liveLink: "#",
      createdAt: "USA Collaboration",
    },
    {
      title: "6number Chungi",
      description:
        "Currently in development - A location-based service platform with integrated mapping and local business features.",
      tech: ["Laravel", "Google Maps API", "Database", "Location Services"],
      features: ["Location tracking", "Business listings", "User reviews", "Interactive maps"],
      icon: MapPin,
      gradient: "from-orange-600 to-red-600",
      liveLink: "#",
      createdAt: "In Development",
      status: "Current Project",
    },
    {
      title: "Pizza Shop Website",
      description:
        "A modern, responsive pizza shop website with online ordering system, menu display, and customer management features.",
      tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      features: ["Online ordering", "Menu management", "Customer portal", "Mobile responsive"],
      icon: Pizza,
      gradient: "from-orange-600 to-red-600",
      liveLink: "https://pizza-shop-webpage.vercel.app/",
      createdAt: "Friday, May 31, 2024",
    },
    {
      title: "Sorry Project",
      description:
        "An interactive apology website with beautiful animations and personalized messages for expressing heartfelt apologies.",
      tech: ["HTML", "CSS", "JavaScript", "Animations"],
      features: ["Interactive animations", "Personalized messages", "Beautiful UI", "Emotional design"],
      icon: Heart,
      gradient: "from-pink-600 to-rose-600",
      liveLink: "https://sorry-tau-tawny.vercel.app/",
      createdAt: "Sunday, March 23, 2025",
    },
    {
      title: "Proposal Website",
      description:
        "A romantic proposal website with elegant design, interactive elements, and memorable user experience for special moments.",
      tech: ["HTML", "CSS", "JavaScript", "Interactive Design"],
      features: ["Romantic design", "Interactive elements", "Memory gallery", "Special animations"],
      icon: Heart,
      gradient: "from-purple-600 to-pink-600",
      liveLink: "https://porposal-rho.vercel.app/",
      createdAt: "Sunday, March 23, 2025",
    },
    {
      title: "University Landing Page",
      description:
        "A comprehensive university landing page showcasing programs, facilities, and admission information with modern design.",
      tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      features: ["Program showcase", "Admission info", "Campus gallery", "Contact forms"],
      icon: GraduationCap,
      gradient: "from-blue-600 to-indigo-600",
      liveLink: "https://my-university-landing-webpage.vercel.app/",
      createdAt: "Sunday, March 23, 2025",
    },
    {
      title: "Article Scribe Craft",
      description:
        "AI-powered article writing platform that helps users create high-quality content with intelligent suggestions and editing tools.",
      tech: ["AI Integration", "JavaScript", "Content Management", "API"],
      features: ["AI writing assistance", "Content optimization", "Grammar checking", "SEO suggestions"],
      icon: PenTool,
      gradient: "from-green-600 to-teal-600",
      liveLink: "https://article-scribe-craft.vercel.app/",
      createdAt: "Recent Project",
    },
  ]

  return (
    <section id="projects" className="relative z-10 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {projects.map((project, index) => (
            <motion.div key={project.title} variants={fadeInUp}>
              <Card
                className={`bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 h-full ${project.status === "Current Project" ? "border-2 border-purple-500" : ""}`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${project.gradient}`}>
                      <project.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {project.title}
                        {project.status === "Current Project" && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{project.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">{project.description}</p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {project.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span className="text-sm text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.liveLink !== "#" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      onClick={() => window.open(project.liveLink, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
