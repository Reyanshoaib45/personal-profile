"use client"

import { motion } from "framer-motion"
import { Clock, Target, Eye, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function WorkPhilosophySection() {
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

  const workEthic = [
    { icon: Clock, title: "Early Starter", description: "Begin work at 8:00 AM sharp, maximizing productive hours" },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Focus on finalizing and launching live projects successfully",
    },
    { icon: Eye, title: "Detail-Focused", description: "Meticulous attention to code quality and user experience" },
    { icon: TrendingUp, title: "Growth Mindset", description: "Continuously improving and learning new technologies" },
  ]

  return (
    <section className="relative z-10 py-20 px-4 bg-gray-800/30">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Work Philosophy
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {workEthic.map((item, index) => (
            <motion.div key={item.title} variants={fadeInUp}>
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 text-center h-full">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
