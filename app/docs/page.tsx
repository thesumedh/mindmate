"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import ShaderBackground from "@/components/shader-background"
import { ChevronDown } from 'lucide-react'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["abstract"]))

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSections(newExpanded)
  }

  const sections: Section[] = [
    {
      id: "abstract",
      title: "Abstract",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>
            The MindMate project proposes an AI-driven chatbot designed to help users cope with anxiety, stress, and depression by providing empathetic conversation and wellness guidance. MindMate leverages Google's Gemini API – a powerful multimodal large language model – to generate human-like responses in real time. The system is implemented as a secure cross-platform application (e.g. mobile/web) with a back-end that calls Gemini for conversational content.
          </p>
          <p>
            We emphasize privacy (end-to-end encryption, optional anonymity), 24/7 availability, and evidence-based support techniques (e.g. cognitive-behavioral prompts). Literature on existing mental health chatbots (Woebot, Wysa, Youper, etc.) shows that AI chat interventions can significantly reduce symptoms of anxiety and depression. MindMate builds on this prior work by integrating the latest AI model (Gemini) to provide instant empathetic feedback, scalable support, and adaptive dialogue.
          </p>
          <div className="mt-4 text-xs text-white/60">
            <p>
              <strong>Keywords:</strong> Mental health, AI chatbot, emotional support, Google Gemini, cognitive behavioral therapy, digital therapy, accessibility, privacy
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>
            Mental health disorders affect a vast and growing segment of the population. According to the World Health Organization, over 1 billion people worldwide live with conditions such as anxiety and depression. These disorders are among the leading causes of disability and impose an economic burden estimated at over US$1 trillion annually. In the United States alone, over 21% of adults reported a mental illness in 2020.
          </p>
          <p>
            Despite this prevalence, access to care remains limited: many communities face severe shortages of mental health professionals (e.g. most U.S. counties lack any psychiatrists), while costs, inadequate insurance coverage, and stigma deter people from seeking help. Consequently, nearly half of those who could benefit from therapy do not receive it.
          </p>
          <p>
            AI chatbots are emerging as a promising way to reduce these barriers. By offering anonymous, on-demand support, chatbots can engage users without long waitlists or travel. They operate 24/7, "never judge," and can simulate human-like conversation. Research shows that digital interventions improve privacy and reduce stigma: by providing anonymity, chatbots help users open up about sensitive issues.
          </p>
          <p>
            MindMate is a proposed AI chatbot system that harnesses these advantages. It is built on Google's Gemini API, enabling real-time conversational AI that can empathize with users and provide tailored guidance. In this paper, we review relevant literature on therapy chatbots, describe our technical approach and system design, and argue how MindMate's features improve over existing solutions.
          </p>
        </div>
      ),
    },
    {
      id: "methodology",
      title: "Methodology",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>The MindMate system is implemented as a secure, scalable web/mobile application using a modern AI stack:</p>
          <ul className="space-y-3 ml-4">
            <li>
              <strong>AI Model (Google Gemini):</strong> We use Google's Gemini API (accessible via Google Cloud) to generate responses. Gemini is a state-of-the-art multimodal large language model providing REST and streaming endpoints for natural language understanding and content generation.
            </li>
            <li>
              <strong>Front-End:</strong> The user interface is built as a cross-platform app (e.g. using Flutter or React Native) for mobile and web. The chat UI captures text input and optionally voice or image input, leveraging Gemini's multimodal capability.
            </li>
            <li>
              <strong>Back-End:</strong> A cloud-hosted server (e.g. on Google Cloud) manages authentication, conversation state, and API calls. We use a lightweight framework (such as Python FastAPI or Node.js) to forward messages to Gemini's REST API.
            </li>
            <li>
              <strong>Data Storage & Security:</strong> We store minimal user data. Conversation logs are encrypted at rest; personal identifiers are not required to use MindMate. All communication uses HTTPS/TLS.
            </li>
            <li>
              <strong>Development Process:</strong> We followed an iterative Agile process, gathering requirements from mental health professionals and potential users, designing conversation flows, implementing a prototype, and conducting pilot tests.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "literature-review",
      title: "Literature Review",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>
            AI chatbots for mental health have proliferated in recent years. Woebot, one of the first fully automated CBT-based chatbots, showed promising results: in a randomized trial, young adults interacting with Woebot twice daily for two weeks had significantly greater reductions in depression and anxiety than a control group.
          </p>
          <p>
            A recent systematic review corroborates these findings: across multiple studies, AI CBT chatbots (Woebot, Wysa, Youper) consistently reduced symptoms of depression and anxiety. The review concludes that such chatbots are "highly promising because of their availability and effectiveness in mental health support," especially when professional help is unavailable.
          </p>
          <p>
            However, researchers caution that chatbots are supplements, not replacements, for human therapists. A recent Stanford investigation found that certain LLM chatbots can exhibit biased or unsafe responses (e.g. stigmatizing some conditions, or encouraging dangerous behaviors) when acting as "therapists". This underscores the need for careful design and safeguards.
          </p>
        </div>
      ),
    },
    {
      id: "proposed-approach",
      title: "Proposed Approach",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>MindMate advances beyond existing solutions through several unique features:</p>
          <ul className="space-y-3 ml-4">
            <li>
              <strong>Advanced Empathetic AI:</strong> By leveraging Google's Gemini model, MindMate can produce nuanced, context-aware replies. We also exploit Gemini's multimodal capabilities: users can optionally send voice messages or images, and the model can process these inputs to inform its responses.
            </li>
            <li>
              <strong>Instant, Always-On Support:</strong> MindMate is available 24/7 with minimal latency. We utilize Gemini's streaming API so responses appear as the model generates them, giving users an immediate conversational experience.
            </li>
            <li>
              <strong>Privacy and Security:</strong> MindMate is built with privacy-first design. Users are not required to share personal identifiers or clinical records, and all conversation data is encrypted both in transit and at rest.
            </li>
            <li>
              <strong>Evidence-Based Guidance:</strong> MindMate incorporates proven therapeutic techniques. The system has built-in modules for cognitive-behavioral coping strategies, mindfulness prompts, and mood tracking.
            </li>
            <li>
              <strong>Human Safety Escalation:</strong> MindMate continuously monitors for signs of severe distress and can escalate to emergency resources if needed.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "system-architecture",
      title: "System Architecture",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>The system architecture of MindMate consists of the following modules:</p>
          <ul className="space-y-3 ml-4">
            <li>
              <strong>User Interface (Frontend):</strong> A mobile/web app (built with Flutter) provides the chat interface, mood trackers, and resources. It supports text input and optional multimodal input (voice messages, images).
            </li>
            <li>
              <strong>Conversation Engine (Backend):</strong> A cloud-based service (hosted on Google Cloud) manages the dialogue, maintains session state, and sends user messages to the Gemini API.
            </li>
            <li>
              <strong>AI Model (Google Gemini):</strong> Hosted in Google's Vertex AI platform, Gemini provides the core language capabilities.
            </li>
            <li>
              <strong>Data Storage:</strong> We use a secure cloud database (e.g. Firestore or Cloud SQL) to store user preferences and encrypted conversation logs.
            </li>
            <li>
              <strong>Security & Compliance:</strong> The architecture is deployed on a HIPAA/GDPR-compliant cloud environment with standard security measures including HTTPS, firewalls, and regular audits.
            </li>
            <li>
              <strong>Analytics & Monitoring:</strong> An admin dashboard collects anonymized usage statistics to help improve the system.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "conclusion",
      title: "Conclusion",
      content: (
        <div className="space-y-4 text-sm text-white/90 leading-relaxed">
          <p>
            MindMate aims to harness advanced AI to tackle the urgent mental health crisis by delivering immediate, empathetic support to users suffering from anxiety, stress, or depression. By combining Google's powerful Gemini model with a privacy-first mobile app, MindMate offers constant 24/7 assistance, cost-effective scalability, and personalization at unprecedented scale.
          </p>
          <p>
            We expect that MindMate will complement traditional therapy – for example, augmenting care for those on waitlists or providing booster sessions between clinician appointments. Prior studies suggest that chatbot interventions can meaningfully reduce mental health symptoms; MindMate builds on these by offering a more sophisticated AI and stringent safety measures.
          </p>
          <p>
            Future work will involve rigorous evaluation through randomized controlled trials, enhanced personalization using reinforcement learning, and expanded content including multi-language support. Maintaining privacy and ethical standards remains paramount; ongoing monitoring and feedback will guide refinements.
          </p>
        </div>
      ),
    },
  ]

  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                MindMate Research Paper
              </span>
            </h1>
            <p className="text-white/60 text-lg">
              An AI-Powered Chatbot for Mental Health Support
            </p>
          </div>

          {/* Authors & Metadata */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/10">
            <div className="space-y-3 text-sm text-white/70">
              <p>
                <strong className="text-white">Authors:</strong> Sumedh Chandanshive, Ketan Choraghe, Tejas Khairnar, Krushna Bayas
              </p>
              <p>
                <strong className="text-white">Institution:</strong> Parvatibai Genba Sopanrao Moze College of Engineering, Wagholi Pune 412207
              </p>
              <p>
                <strong className="text-white">Advisor:</strong> Prof. Vrushali Dhanokar
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <nav className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className="text-left text-white/70 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                      expandedSections.has(section.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSections.has(section.id) && (
                  <div className="px-6 pb-6 border-t border-white/10 pt-6">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Back to Chat */}
          <div className="mt-12 flex justify-center gap-4">
            <Link
              href="/chat"
              className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              Back to Chat
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    </ShaderBackground>
  )
}
