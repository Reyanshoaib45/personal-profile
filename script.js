$(document).ready(() => {
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

  // Enhanced Typing Effect
  const typingTexts = [
    "Full Stack Developer",
    "Backend Developer",
    "Laravel Expert",
    "JavaScript Developer",
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
  setTimeout(typeEffect, 1500)

  // Initialize AOS
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    })
  }

  // Enhanced Navbar scroll effect
  $(window).scroll(() => {
    if ($(window).scrollTop() > 50) {
      $(".modern-navbar").addClass("scrolled")
    } else {
      $(".modern-navbar").removeClass("scrolled")
    }
  })

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
    var rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // Trigger skill bar animation on scroll
  $(window).on("scroll", () => {
    animateSkillBars()
  })

  // Trigger skill bar animation on page load
  animateSkillBars()

  // Scroll indicator click
  $(".scroll-indicator").on("click", () => {
    $("html, body").animate(
      {
        scrollTop: $("#about").offset().top - 80,
      },
      1000,
    )
  })

  // Enhanced card hover effects
  $(".about-card, .skill-card, .project-card, .philosophy-card, .contact-card, .pricing-card").hover(
    function () {
      $(this).addClass("shadow-lg")
    },
    function () {
      $(this).removeClass("shadow-lg")
    },
  )

  // Mobile menu close on link click
  $(".modern-nav-link").on("click", () => {
    if ($(window).width() < 992) {
      $(".navbar-collapse").collapse("hide")
    }
  })

  // Enhanced parallax effect for hero background
  $(window).scroll(() => {
    var scrolled = $(window).scrollTop()
    var parallax = $(".hero-bg-gradient")
    var speed = scrolled * 0.3
    parallax.css("transform", "translateY(" + speed + "px)")
  })

  // Enhanced active navigation highlighting
  $(window)
    .scroll(() => {
      var scrollDistance = $(window).scrollTop()

      // Define sections in order
      const sections = [
        "#home",
        "#about",
        "#skills",
        "#current-projects",
        "#collaborations",
        "#projects",
        "#pricing",
        "#contact",
      ]

      sections.forEach((section, index) => {
        const $section = $(section)
        if ($section.length && $section.position().top <= scrollDistance + 100) {
          $(".modern-nav-link.active").removeClass("active")
          $(`.modern-nav-link[href="${section}"]`).addClass("active")
        }
      })
    })
    .scroll()

  // Enhanced button click effects
  $(".btn, .modern-hire-btn").on("click", function () {
    $(this).addClass("animate__animated animate__pulse")
    setTimeout(() => {
      $(this).removeClass("animate__animated animate__pulse")
    }, 600)
  })

  // Pricing card interactions
  $(".pricing-card").hover(
    function () {
      $(this).find(".pricing-icon").addClass("animate__animated animate__pulse")
    },
    function () {
      $(this).find(".pricing-icon").removeClass("animate__animated animate__pulse")
    },
  )

  // Enhanced mobile navigation toggle
  $(".modern-toggler").on("click", function () {
    $(this).toggleClass("active")
    setTimeout(() => {
      $(this).attr("aria-expanded", $(this).attr("aria-expanded") === "true" ? "false" : "true")
    }, 10)
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

  // Enhanced intersection observer for better performance
  function createIntersectionObserver() {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view")

              // Trigger specific animations based on element type
              if (entry.target.classList.contains("pricing-card")) {
                $(entry.target).find(".pricing-icon").addClass("animate__animated animate__bounceIn")
              }

              if (entry.target.classList.contains("skill-card")) {
                animateSkillBars()
              }
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        },
      )

      document
        .querySelectorAll(".project-card, .skill-card, .about-card, .pricing-card, .philosophy-card")
        .forEach((card) => {
          observer.observe(card)
        })
    }
  }

  // Initialize enhanced intersection observer
  createIntersectionObserver()

  // Console welcome message with enhanced styling
  console.log(
    "%c🚀 Welcome to M Reyan Shoaib's Enhanced Portfolio!",
    "color: #8b5cf6; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);",
  )
  console.log(
    "%c💼 Interested in collaboration? Check out my GitHub: https://github.com/Reyanshoaib45",
    "color: #3b82f6; font-size: 14px; font-weight: 600;",
  )
  console.log("%c💰 View pricing and services above!", "color: #10b981; font-size: 14px; font-weight: 600;")

  // Enhanced responsive handling
  function handleResponsiveFeatures() {
    const windowWidth = $(window).width()

    if (windowWidth < 768) {
      // Mobile optimizations
      $(".cursor-glow").css("opacity", "0.3")
      $(".floating-particles").hide()
    } else {
      // Desktop features
      $(".cursor-glow").css("opacity", "1")
      $(".floating-particles").show()
    }

    if (windowWidth < 576) {
      // Extra small screen optimizations
      $(".hero-buttons .btn").addClass("w-100 mb-2")
      $(".pricing-card.featured").removeClass("featured")
    } else {
      $(".hero-buttons .btn").removeClass("w-100 mb-2")
    }
  }

  // Initialize responsive features
  handleResponsiveFeatures()

  // Handle window resize with debouncing
  let resizeTimer
  $(window).on("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(handleResponsiveFeatures, 250)
  })

  // Enhanced touch device optimization
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    $("body").addClass("touch-device")

    // Optimize cursor effect for touch devices
    $(".cursor-glow").css({
      opacity: "0.5",
      position: "fixed",
      top: "50%",
      left: "50%",
    })

    // Add touch-friendly interactions
    $(".pricing-card, .project-card, .skill-card")
      .on("touchstart", function () {
        $(this).addClass("touch-active")
      })
      .on("touchend", function () {
        setTimeout(() => {
          $(this).removeClass("touch-active")
        }, 150)
      })
  }

  // Preloader handling
  $(window).on("load", () => {
    $(".preloader").fadeOut("slow")

    // Initialize animations after load
    setTimeout(() => {
      $(".hero-content").addClass("loaded")
      animateParticles()
    }, 500)
  })

  // Enhanced error handling for external links
  $('a[target="_blank"]').on("click", function () {
    var link = $(this).attr("href")
    console.log("External link clicked:", link)

    // Add loading state
    $(this).addClass("loading")
    setTimeout(() => {
      $(this).removeClass("loading")
    }, 1000)
  })

  // Initialize tooltips if Bootstrap is available
  if (typeof bootstrap !== "undefined") {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

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

    ticking = false
  }

  $(window).on("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects)
      ticking = true
    }
  })
})

// Additional utility functions
function debounce(func, wait, immediate) {
  var timeout
  return function () {
    var args = arguments
    var later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

// Enhanced performance monitoring
const optimizedScroll = debounce(() => {
  // Additional scroll-based functionality
}, 16) // ~60fps

$(window).on("scroll", optimizedScroll)

// Service Worker registration for PWA features (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}
