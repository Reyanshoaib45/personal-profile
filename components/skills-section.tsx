"use client"

import { motion } from "framer-motion"
import { Code2, Terminal, Globe, Database, Shield, Smartphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SkillsSection() {
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

  const skills = [
    { name: "PHP (Laravel 11)", level: 95, icon: Code2, color: "from-purple-500 to-pink-500" },
    { name: "JavaScript & jQuery", level: 90, icon: Terminal, color: "from-yellow-500 to-orange-500" },
    { name: "HTML & CSS", level: 95, icon: Globe, color: "from-blue-500 to-cyan-500" },
    { name: "Database Management", level: 85, icon: Database, color: "from-green-500 to-emerald-500" },
    { name: "Form Validation", level: 90, icon: Shield, color: "from-red-500 to-pink-500" },
    { name: "UI/UX Design", level: 80, icon: Smartphone, color: "from-indigo-500 to-purple-500" },
  ]

  return (
    <section id="skills" className="relative z-10 py-20 px-4 bg-gray-800/30">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Tech Skills
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {skills.map((skill, index) => (
            <motion.div key={skill.name} variants={fadeInUp}>
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${skill.color}`}>
                      <skill.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">{skill.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Proficiency</span>
                      <span className="text-white">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${skill.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
