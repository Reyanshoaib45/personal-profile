$(document).ready(() => {
  // --- Section Loader ---
  const sections = [
    { id: "navbar-placeholder", file: "sections/navbar.html" },
    { id: "hero-placeholder", file: "sections/hero.html" },
    { id: "about-placeholder", file: "sections/about.html" },
    { id: "skills-placeholder", file: "sections/skills.html" },
    { id: "case-studies-placeholder", file: "sections/case-studies.html" },
    { id: "current-projects-placeholder", file: "sections/current-projects.html" },
    { id: "collaborations-placeholder", file: "sections/collaborations.html" },
    { id: "projects-placeholder", file: "sections/projects.html" },
    { id: "pricing-placeholder", file: "sections/pricing.html" },
    { id: "philosophy-placeholder", file: "sections/philosophy.html" },
    { id: "contact-placeholder", file: "sections/contact.html" },
    { id: "footer-placeholder", file: "sections/footer.html" },
  ]

  // Filter out missing placeholders to avoid errors
  const validSections = sections.filter((s) => document.getElementById(s.id))

  Promise.all(
    validSections.map((section) =>
      fetch(section.file)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          return response.text()
        })
        .then((data) => {
          document.getElementById(section.id).innerHTML = data
        })
        .catch((err) => console.error(`Failed to load ${section.file}:`, err)),
    ),
  ).then(() => {
    // Initialize everything after all sections are loaded
    initializePortfolio()
    // Hide preloader
    $(".preloader").fadeOut("slow")
  })

  function initializePortfolio() {
    // Enhanced Cursor Following Effect
    let mouseX = 0
    let mouseY = 0
    const cursorGlow = document.getElementById("cursorGlow")

    function updateCursorGlow(e) {
      mouseX = e.clientX
      mouseY = e.clientY

      if (cursorGlow) {
        cursorGlow.style.left = mouseX + "px"
        cursorGlow.style.top = mouseY + "px"
      }
    }

    // Smooth cursor movement with requestAnimationFrame
    function animateCursor() {
      if (cursorGlow) {
        cursorGlow.style.transform = `translate(-50%, -50%)`
      }
      requestAnimationFrame(animateCursor)
    }

    // Initialize cursor effect
    document.addEventListener("mousemove", updateCursorGlow)
    animateCursor()

    // Enhanced Typing Effect - Updated for Backend Focus
    const typingTexts = [
      "Backend Systems Engineer",
      "Laravel Architect",
      "Data Integrity Specialist",
      "API Developer",
      "Problem Solver",
      "International Collaborator",
    ]

    let textIndex = 0
    let charIndex = 0
    let isDeleting = false
    const typingSpeed = 100
    const deletingSpeed = 50
    const pauseTime = 2000

    function typeEffect() {
      const currentText = typingTexts[textIndex]
      const typingElement = document.getElementById("typing-text")

      if (!typingElement) return

      if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1)
        charIndex--
      } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1)
        charIndex++
      }

      let typeSpeed = isDeleting ? deletingSpeed : typingSpeed

      if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = pauseTime
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        textIndex = (textIndex + 1) % typingTexts.length
      }

      setTimeout(typeEffect, typeSpeed)
    }

    // Start typing effect after a delay
    setTimeout(typeEffect, 1000)

    // Initialize AOS
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      })
    }

    // Smooth scrolling for navigation links
    $('a[href^="#"]').on("click", function (event) {
      var target = $(this.getAttribute("href"))
      if (target.length) {
        event.preventDefault()
        $("html, body")
          .stop()
          .animate(
            {
              scrollTop: target.offset().top - 80,
            },
            1000,
          )
      }
    })

    // Enhanced skill progress bars animation
    function animateSkillBars() {
      $(".skill-card").each(function () {
        var $this = $(this)
        var $progressBar = $this.find(".progress-bar")
        var targetWidth = $progressBar.data("width")

        if (isElementInViewport($this[0]) && !$progressBar.hasClass("animated")) {
          $progressBar.addClass("animated")
          setTimeout(() => {
            $progressBar.css("width", targetWidth + "%")
          }, 200)
        }
      })
    }

    // Check if element is in viewport
    function isElementInViewport(el) {
      if (!el) return false
      var rect = el.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    }

    // Trigger skill bar animation initial check
    animateSkillBars()

    // Scroll indicator click
    $(document).on("click", ".scroll-indicator", () => {
      $("html, body").animate(
        {
          scrollTop: $("#about").offset().top - 80,
        },
        1000,
      )
    })

    // Enhanced card hover effects
    $(document).on(
      {
        mouseenter: function () {
          $(this).addClass("shadow-lg")
        },
        mouseleave: function () {
          $(this).removeClass("shadow-lg")
        },
      },
      ".about-card, .skill-card, .project-card, .philosophy-card, .contact-card, .pricing-card",
    )

    // Mobile menu close on link click
    $(document).on("click", ".modern-nav-link", () => {
      if ($(window).width() < 992) {
        $(".navbar-collapse").collapse("hide")
      }
    })

    // Enhanced button click effects
    $(document).on("click", ".btn, .modern-hire-btn", function () {
      $(this).addClass("animate__animated animate__pulse")
      setTimeout(() => {
        $(this).removeClass("animate__animated animate__pulse")
      }, 600)
    })

    // Enhanced mobile navigation toggle
    $(document).on("click", ".modern-toggler", function () {
      $(this).toggleClass("active")
    })

    // Floating particles animation
    function animateParticles() {
      $(".particle").each(function (index) {
        const particle = $(this)
        const randomX = Math.random() * 100
        const randomY = Math.random() * 100
        const randomDelay = Math.random() * 2000

        setTimeout(() => {
          particle.css({
            left: randomX + "%",
            top: randomY + "%",
          })
        }, randomDelay)
      })
    }

    // Initialize particle animation
    setInterval(animateParticles, 8000)
    animateParticles()

    // Enhanced scroll performance
    let ticking = false

    function updateScrollEffects() {
      const scrollTop = $(window).scrollTop()

      // Update navbar
      if (scrollTop > 50) {
        $(".modern-navbar").addClass("scrolled")
      } else {
        $(".modern-navbar").removeClass("scrolled")
      }

      // Update parallax
      const parallaxSpeed = scrollTop * 0.3
      $(".hero-bg-gradient").css("transform", `translateY(${parallaxSpeed}px)`)

      // Skill bar animation
      animateSkillBars()

      // Active navigation highlighting
      const navLinks = $(".modern-nav-link")
      const sections = []
      navLinks.each(function () {
        const href = $(this).attr("href")
        if (href && href.startsWith("#")) sections.push(href)
      })

      sections.forEach((section) => {
        const $section = $(section)
        if ($section.length && $section.position().top <= scrollTop + 100) {
          $(".modern-nav-link.active").removeClass("active")
          $(`.modern-nav-link[href="${section}"]`).addClass("active")
        }
      })

      ticking = false
    }

    $(window).on("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects)
        ticking = true
      }
    })

    // Mobile optimizations
    function handleResponsiveFeatures() {
      const windowWidth = $(window).width()
      if (windowWidth < 768) {
        $(".cursor-glow").css("opacity", "0.3")
        $(".floating-particles").hide()
      } else {
        $(".cursor-glow").css("opacity", "1")
        $(".floating-particles").show()
      }
    }

    handleResponsiveFeatures()
    $(window).on("resize", handleResponsiveFeatures)

    // Console welcome message
    console.log(
      "%c🚀 Welcome to M Reyan Shoaib's Modularized Portfolio!",
      "color: #8b5cf6; font-size: 18px; font-weight: bold;",
    )
  }
})
