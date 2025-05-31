"use client"

import { motion } from "framer-motion"
import { Brain, Rocket, Globe, Settings, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AboutSection() {
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

  return (
    <section id="about" className="relative z-10 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={fadeInUp}>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white">The Developer</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Hi! I'm M Reyan Shoaib — a passionate full stack web developer with a proven track record of building
                  dynamic, user-friendly, and performance-optimized websites. I specialize in solving real-world
                  problems using clean, maintainable code.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  My expertise spans from managing complex ad networks and validating dynamic forms to building complete
                  web solutions from scratch. I'm currently working on multiple high-impact projects including
                  ad-serving websites and custom proxy management systems.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Rocket className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">What I Do</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Full Stack Development</h4>
                      <p className="text-gray-400 text-sm">Laravel + JavaScript ecosystem mastery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Dynamic Web Applications</h4>
                      <p className="text-gray-400 text-sm">Invoice tools, user systems, form validation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Problem Solving</h4>
                      <p className="text-gray-400 text-sm">Ad errors, domain issues, complex validations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Growth & Monetization</h4>
                      <p className="text-gray-400 text-sm">Ad network management and optimization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
