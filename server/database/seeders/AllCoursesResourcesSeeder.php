<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\ExternalResource;
use App\Models\AchievementBadge;
use App\Models\CohortLeaderboard;
use App\Models\CohortParticipant;
use App\Models\User;

class AllCoursesResourcesSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            'ai' => 'AI (Generative AI & Automation)',
            'cloud-foundation' => 'Cloud Foundation',
            'cybersecurity' => 'Cybersecurity',
            'DevOps' => 'DevOps',
            'Web3-and-Blockchain-development' => 'Web3 and Blockchain Development',
            'ui-ux' => 'UI/UX (Product Design) Design',
            'product-management' => 'Product Management',
            'Digital-marketing' => 'Digital Marketing',
            'Data-Analysis' => 'Data Analysis',
            'Video-Editing' => 'Video Editing & Content Creation',
            'Frontend-Development' => 'Frontend Development',
            'Backend-Development' => 'Backend Development',
            'Leadership-Training' => 'Leadership Training'
        ];

        foreach ($courses as $courseId => $courseName) {
            $this->seedCourse($courseId, $courseName);
        }
    }

    private function seedCourse(string $courseId, string $courseName): void
    {
        // Create Sprint Materials based on course type
        $sprints = $this->getSprintsForCourse($courseId);
        
        foreach ($sprints as $index => $sprintData) {
            $sprint = CourseMaterial::create([
                'course_id' => $courseId,
                'sprint_name' => $sprintData['name'],
                'sprint_number' => $index + 1,
                'order' => $index + 1,
            ]);

            // Add material items for each sprint
            foreach ($sprintData['materials'] as $materialIndex => $material) {
                MaterialItem::create([
                    'course_material_id' => $sprint->id,
                    'title' => $material['title'],
                    'type' => $material['type'],
                    'file_path' => $material['path'],
                    'file_size' => $material['size'],
                    'order' => $materialIndex + 1,
                ]);
            }
        }

        // Create External Resources
        $resources = $this->getResourcesForCourse($courseId);
        
        foreach ($resources['video_tutorials'] as $index => $video) {
            ExternalResource::create([
                'course_id' => $courseId,
                'category' => 'video_tutorials',
                'title' => $video['title'],
                'description' => $video['description'],
                'url' => $video['url'],
                'source' => $video['source'],
                'duration' => $video['duration'],
                'order' => $index + 1,
            ]);
        }

        foreach ($resources['industry_articles'] as $index => $article) {
            ExternalResource::create([
                'course_id' => $courseId,
                'category' => 'industry_articles',
                'title' => $article['title'],
                'description' => $article['description'],
                'url' => $article['url'],
                'source' => $article['source'],
                'order' => $index + 1,
            ]);
        }

        foreach ($resources['recommended_reading'] as $index => $reading) {
            ExternalResource::create([
                'course_id' => $courseId,
                'category' => 'recommended_reading',
                'title' => $reading['title'],
                'description' => $reading['description'],
                'url' => $reading['url'],
                'source' => $reading['source'],
                'order' => $index + 1,
            ]);
        }

        // Create Achievement Badges
        for ($i = 1; $i <= 4; $i++) {
            AchievementBadge::create([
                'course_id' => $courseId,
                'name' => "Sprint {$i}",
                'description' => $courseName,
                'badge_color' => '#9333EA',
                'unlock_type' => 'sprint_completion',
                'unlock_value' => $i,
            ]);
        }

        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Course Completion',
            'description' => $courseName,
            'badge_color' => '#10B981',
            'unlock_type' => 'course_completion',
            'unlock_value' => 1,
        ]);

        // Create Cohort Leaderboard
        $cohort = CohortLeaderboard::create([
            'course_id' => $courseId,
            'cohort_name' => $courseName . ' Cohort 2025',
            'start_date' => now()->subDays(30),
            'end_date' => now()->addDays(60),
        ]);

        // Add sample participants
        $this->createCohortParticipants($cohort->id);
    }

    private function getSprintsForCourse(string $courseId): array
    {
        $sprintTemplates = [
            'ai' => [
                ['name' => 'Sprint 1: AI Foundations & Prompt Engineering', 'materials' => [
                    ['title' => 'Introduction to Generative AI.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint1/intro-to-ai.pdf", 'size' => '3.2 MB'],
                    ['title' => 'Prompt Engineering Masterclass.pptx', 'type' => 'document', 'path' => "courses/ai/sprint1/prompt-engineering.pptx", 'size' => '6.1 MB'],
                    ['title' => 'ChatGPT Best Practices Guide.docx', 'type' => 'document', 'path' => "courses/ai/sprint1/chatgpt-guide.docx", 'size' => '1.8 MB'],
                ]],
                ['name' => 'Sprint 2: AI Content Creation', 'materials' => [
                    ['title' => 'AI Image Generation Techniques.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint2/image-generation.pdf", 'size' => '4.5 MB'],
                    ['title' => 'MidJourney Complete Tutorial.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint2/midjourney-tutorial.pdf", 'size' => '5.8 MB'],
                    ['title' => 'DALL-E Usage Guide.docx', 'type' => 'document', 'path' => "courses/ai/sprint2/dalle-guide.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 3: Automation & Workflow Design', 'materials' => [
                    ['title' => 'No-Code Automation Guide.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint3/automation-guide.pdf", 'size' => '2.9 MB'],
                    ['title' => 'Make.com Workflows.pptx', 'type' => 'document', 'path' => "courses/ai/sprint3/make-workflows.pptx", 'size' => '7.3 MB'],
                    ['title' => 'Zapier Integration Templates.zip', 'type' => 'document', 'path' => "courses/ai/sprint3/zapier-templates.zip", 'size' => '5.4 MB'],
                ]],
                ['name' => 'Sprint 4: AI Agents & Advanced Implementation', 'materials' => [
                    ['title' => 'Building AI Agents.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint4/ai-agents.pdf", 'size' => '3.7 MB'],
                    ['title' => 'Knowledge Base Setup.docx', 'type' => 'document', 'path' => "courses/ai/sprint4/knowledge-base.docx", 'size' => '2.4 MB'],
                    ['title' => 'Final Project Guidelines.pdf', 'type' => 'pdf', 'path' => "courses/ai/sprint4/final-project.pdf", 'size' => '1.9 MB'],
                ]],
            ],
            'cloud-foundation' => [
                ['name' => 'Sprint 1: Cloud Computing Fundamentals', 'materials' => [
                    ['title' => 'Introduction to Cloud Computing.pdf', 'type' => 'pdf', 'path' => "courses/cloud-foundation/sprint1/cloud-intro.pdf", 'size' => '2.8 MB'],
                    ['title' => 'AWS vs Azure vs GCP.pptx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint1/cloud-comparison.pptx", 'size' => '5.6 MB'],
                    ['title' => 'Cloud Service Models.docx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint1/service-models.docx", 'size' => '1.7 MB'],
                ]],
                ['name' => 'Sprint 2: Infrastructure as Code', 'materials' => [
                    ['title' => 'Terraform Basics.pdf', 'type' => 'pdf', 'path' => "courses/cloud-foundation/sprint2/terraform-basics.pdf", 'size' => '3.4 MB'],
                    ['title' => 'CloudFormation Templates.zip', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint2/cloudformation.zip", 'size' => '4.2 MB'],
                    ['title' => 'Infrastructure Automation.pptx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint2/automation.pptx", 'size' => '6.8 MB'],
                ]],
                ['name' => 'Sprint 3: Cloud Security & Compliance', 'materials' => [
                    ['title' => 'Cloud Security Best Practices.pdf', 'type' => 'pdf', 'path' => "courses/cloud-foundation/sprint3/security-practices.pdf", 'size' => '4.1 MB'],
                    ['title' => 'IAM Configuration Guide.docx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint3/iam-guide.docx", 'size' => '2.3 MB'],
                    ['title' => 'Compliance Frameworks.pdf', 'type' => 'pdf', 'path' => "courses/cloud-foundation/sprint3/compliance.pdf", 'size' => '3.9 MB'],
                ]],
                ['name' => 'Sprint 4: Advanced Cloud Architecture', 'materials' => [
                    ['title' => 'Microservices Architecture.pdf', 'type' => 'pdf', 'path' => "courses/cloud-foundation/sprint4/microservices.pdf", 'size' => '5.2 MB'],
                    ['title' => 'Auto-scaling Implementation.pptx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint4/auto-scaling.pptx", 'size' => '6.8 MB'],
                    ['title' => 'Load Balancing Strategies.docx', 'type' => 'document', 'path' => "courses/cloud-foundation/sprint4/load-balancing.docx", 'size' => '2.6 MB'],
                ]],
            ],
            'cybersecurity' => [
                ['name' => 'Sprint 1: Security Fundamentals', 'materials' => [
                    ['title' => 'Introduction to Cybersecurity.pdf', 'type' => 'pdf', 'path' => "courses/cybersecurity/sprint1/cyber-intro.pdf", 'size' => '3.1 MB'],
                    ['title' => 'Network Security Basics.pptx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint1/network-security.pptx", 'size' => '4.9 MB'],
                    ['title' => 'Security Frameworks Overview.docx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint1/frameworks.docx", 'size' => '2.2 MB'],
                ]],
                ['name' => 'Sprint 2: Threat Detection & Analysis', 'materials' => [
                    ['title' => 'SIEM Tools Guide.pdf', 'type' => 'pdf', 'path' => "courses/cybersecurity/sprint2/siem-guide.pdf", 'size' => '4.3 MB'],
                    ['title' => 'Log Analysis Workshop.pptx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint2/log-analysis.pptx", 'size' => '5.7 MB'],
                    ['title' => 'Threat Intelligence.docx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint2/threat-intel.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 3: Penetration Testing', 'materials' => [
                    ['title' => 'Ethical Hacking Techniques.pdf', 'type' => 'pdf', 'path' => "courses/cybersecurity/sprint3/ethical-hacking.pdf", 'size' => '5.7 MB'],
                    ['title' => 'Kali Linux Toolkit.pdf', 'type' => 'pdf', 'path' => "courses/cybersecurity/sprint3/kali-tools.pdf", 'size' => '4.9 MB'],
                    ['title' => 'Vulnerability Assessment.pptx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint3/vuln-assessment.pptx", 'size' => '6.3 MB'],
                ]],
                ['name' => 'Sprint 4: Incident Response & Recovery', 'materials' => [
                    ['title' => 'Incident Response Plan Template.pdf', 'type' => 'pdf', 'path' => "courses/cybersecurity/sprint4/incident-response.pdf", 'size' => '3.6 MB'],
                    ['title' => 'Forensics Analysis Guide.pptx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint4/forensics.pptx", 'size' => '7.2 MB'],
                    ['title' => 'Disaster Recovery Planning.docx', 'type' => 'document', 'path' => "courses/cybersecurity/sprint4/disaster-recovery.docx", 'size' => '2.8 MB'],
                ]],
            ],
            'DevOps' => [
                ['name' => 'Sprint 1: DevOps Fundamentals', 'materials' => [
                    ['title' => 'Introduction to DevOps.pdf', 'type' => 'pdf', 'path' => "courses/DevOps/sprint1/devops-intro.pdf", 'size' => '2.9 MB'],
                    ['title' => 'CI-CD Pipeline Basics.pptx', 'type' => 'document', 'path' => "courses/DevOps/sprint1/cicd-basics.pptx", 'size' => '5.4 MB'],
                    ['title' => 'Version Control with Git.docx', 'type' => 'document', 'path' => "courses/DevOps/sprint1/git-guide.docx", 'size' => '1.9 MB'],
                ]],
                ['name' => 'Sprint 2: Containerization & Orchestration', 'materials' => [
                    ['title' => 'Docker Complete Guide.pdf', 'type' => 'pdf', 'path' => "courses/DevOps/sprint2/docker-guide.pdf", 'size' => '4.6 MB'],
                    ['title' => 'Kubernetes Fundamentals.pptx', 'type' => 'document', 'path' => "courses/DevOps/sprint2/kubernetes-fundamentals.pptx", 'size' => '7.1 MB'],
                    ['title' => 'Container Best Practices.docx', 'type' => 'document', 'path' => "courses/DevOps/sprint2/container-practices.docx", 'size' => '2.3 MB'],
                ]],
                ['name' => 'Sprint 3: Infrastructure Automation', 'materials' => [
                    ['title' => 'Ansible Automation.pdf', 'type' => 'pdf', 'path' => "courses/DevOps/sprint3/ansible-automation.pdf", 'size' => '3.8 MB'],
                    ['title' => 'Jenkins Pipeline Setup.pptx', 'type' => 'document', 'path' => "courses/DevOps/sprint3/jenkins-pipeline.pptx", 'size' => '6.2 MB'],
                    ['title' => 'Terraform Deployment.docx', 'type' => 'document', 'path' => "courses/DevOps/sprint3/terraform-deployment.docx", 'size' => '2.7 MB'],
                ]],
                ['name' => 'Sprint 4: Monitoring & Observability', 'materials' => [
                    ['title' => 'Monitoring with Prometheus.pdf', 'type' => 'pdf', 'path' => "courses/DevOps/sprint4/prometheus-monitoring.pdf", 'size' => '4.2 MB'],
                    ['title' => 'Log Management with ELK.pptx', 'type' => 'document', 'path' => "courses/DevOps/sprint4/elk-stack.pptx", 'size' => '6.9 MB'],
                    ['title' => 'Application Performance.docx', 'type' => 'document', 'path' => "courses/DevOps/sprint4/app-performance.docx", 'size' => '2.5 MB'],
                ]],
            ],
            'Web3-and-Blockchain-development' => [
                ['name' => 'Sprint 1: Blockchain Fundamentals', 'materials' => [
                    ['title' => 'Introduction to Blockchain.pdf', 'type' => 'pdf', 'path' => "courses/Web3-and-Blockchain-development/sprint1/blockchain-intro.pdf", 'size' => '3.3 MB'],
                    ['title' => 'Cryptocurrency Basics.pptx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint1/crypto-basics.pptx", 'size' => '5.8 MB'],
                    ['title' => 'Ethereum Overview.docx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint1/ethereum-overview.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 2: Smart Contract Development', 'materials' => [
                    ['title' => 'Solidity Programming Guide.pdf', 'type' => 'pdf', 'path' => "courses/Web3-and-Blockchain-development/sprint2/solidity-guide.pdf", 'size' => '4.9 MB'],
                    ['title' => 'Smart Contract Security.pptx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint2/contract-security.pptx", 'size' => '6.4 MB'],
                    ['title' => 'Testing Smart Contracts.docx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint2/contract-testing.docx", 'size' => '2.6 MB'],
                ]],
                ['name' => 'Sprint 3: dApp Development', 'materials' => [
                    ['title' => 'Web3.js Integration.pdf', 'type' => 'pdf', 'path' => "courses/Web3-and-Blockchain-development/sprint3/web3js-integration.pdf", 'size' => '3.7 MB'],
                    ['title' => 'Building dApps with React.pptx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint3/dapp-react.pptx", 'size' => '7.3 MB'],
                    ['title' => 'MetaMask Integration.docx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint3/metamask-integration.docx", 'size' => '1.8 MB'],
                ]],
                ['name' => 'Sprint 4: NFTs & DeFi', 'materials' => [
                    ['title' => 'NFT Development Guide.pdf', 'type' => 'pdf', 'path' => "courses/Web3-and-Blockchain-development/sprint4/nft-guide.pdf", 'size' => '4.5 MB'],
                    ['title' => 'DeFi Protocol Design.pptx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint4/defi-design.pptx", 'size' => '6.7 MB'],
                    ['title' => 'IPFS Storage Guide.docx', 'type' => 'document', 'path' => "courses/Web3-and-Blockchain-development/sprint4/ipfs-guide.docx", 'size' => '2.2 MB'],
                ]],
            ],
            'ui-ux' => [
                ['name' => 'Sprint 1: Design Foundations', 'materials' => [
                    ['title' => 'Introduction to UI-UX Design.pdf', 'type' => 'pdf', 'path' => "courses/ui-ux/sprint1/uiux-intro.pdf", 'size' => '2.7 MB'],
                    ['title' => 'Design Principles & Color Theory.pptx', 'type' => 'document', 'path' => "courses/ui-ux/sprint1/design-principles.pptx", 'size' => '8.3 MB'],
                    ['title' => 'Typography Essentials.docx', 'type' => 'document', 'path' => "courses/ui-ux/sprint1/typography.docx", 'size' => '1.9 MB'],
                ]],
                ['name' => 'Sprint 2: User Research & Wireframing', 'materials' => [
                    ['title' => 'User Research Methods.pdf', 'type' => 'pdf', 'path' => "courses/ui-ux/sprint2/user-research.pdf", 'size' => '3.4 MB'],
                    ['title' => 'Wireframing with Figma.pptx', 'type' => 'document', 'path' => "courses/ui-ux/sprint2/wireframing-figma.pptx", 'size' => '6.9 MB'],
                    ['title' => 'Creating User Personas.docx', 'type' => 'document', 'path' => "courses/ui-ux/sprint2/user-personas.docx", 'size' => '2.3 MB'],
                ]],
                ['name' => 'Sprint 3: Interactive Prototyping', 'materials' => [
                    ['title' => 'Prototyping Best Practices.pdf', 'type' => 'pdf', 'path' => "courses/ui-ux/sprint3/prototyping-practices.pdf", 'size' => '4.1 MB'],
                    ['title' => 'Advanced Figma Techniques.pptx', 'type' => 'document', 'path' => "courses/ui-ux/sprint3/advanced-figma.pptx", 'size' => '9.2 MB'],
                    ['title' => 'User Testing Guide.docx', 'type' => 'document', 'path' => "courses/ui-ux/sprint3/user-testing.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 4: Design Systems & Handoff', 'materials' => [
                    ['title' => 'Building Design Systems.pdf', 'type' => 'pdf', 'path' => "courses/ui-ux/sprint4/design-systems.pdf", 'size' => '5.3 MB'],
                    ['title' => 'Developer Handoff Process.pptx', 'type' => 'document', 'path' => "courses/ui-ux/sprint4/dev-handoff.pptx", 'size' => '7.8 MB'],
                    ['title' => 'Accessibility Guidelines.docx', 'type' => 'document', 'path' => "courses/ui-ux/sprint4/accessibility.docx", 'size' => '2.9 MB'],
                ]],
            ],
            'product-management' => [
                ['name' => 'Sprint 1: Foundations of Product Management', 'materials' => [
                    ['title' => 'Introduction to Product Management.pdf', 'type' => 'pdf', 'path' => "courses/product-management/sprint1/intro-to-pm.pdf", 'size' => '2.3 MB'],
                    ['title' => 'Product Manager Role & Responsibilities.pptx', 'type' => 'document', 'path' => "courses/product-management/sprint1/pm-role.pptx", 'size' => '5.2 MB'],
                    ['title' => 'Stakeholder Management.docx', 'type' => 'document', 'path' => "courses/product-management/sprint1/stakeholder-mgmt.docx", 'size' => '1.5 MB'],
                ]],
                ['name' => 'Sprint 2: Discovery & Research', 'materials' => [
                    ['title' => 'User Research Methods.pdf', 'type' => 'pdf', 'path' => "courses/product-management/sprint2/research-methods.pdf", 'size' => '3.6 MB'],
                    ['title' => 'Market Analysis Techniques.pptx', 'type' => 'document', 'path' => "courses/product-management/sprint2/market-analysis.pptx", 'size' => '6.4 MB'],
                    ['title' => 'User Interview Template.docx', 'type' => 'document', 'path' => "courses/product-management/sprint2/interview-template.docx", 'size' => '1.8 MB'],
                ]],
                ['name' => 'Sprint 3: Ideation & Strategy', 'materials' => [
                    ['title' => 'Product Strategy Framework.pdf', 'type' => 'pdf', 'path' => "courses/product-management/sprint3/strategy-framework.pdf", 'size' => '4.2 MB'],
                    ['title' => 'Roadmap Planning.pptx', 'type' => 'document', 'path' => "courses/product-management/sprint3/roadmap-planning.pptx", 'size' => '7.1 MB'],
                    ['title' => 'Prioritization Techniques.docx', 'type' => 'document', 'path' => "courses/product-management/sprint3/prioritization.docx", 'size' => '2.2 MB'],
                ]],
                ['name' => 'Sprint 4: Execution & Metrics', 'materials' => [
                    ['title' => 'Agile Product Management.pdf', 'type' => 'pdf', 'path' => "courses/product-management/sprint4/agile-pm.pdf", 'size' => '3.9 MB'],
                    ['title' => 'Product Metrics & KPIs.pptx', 'type' => 'document', 'path' => "courses/product-management/sprint4/metrics-kpis.pptx", 'size' => '6.8 MB'],
                    ['title' => 'Go-to-Market Strategy.docx', 'type' => 'document', 'path' => "courses/product-management/sprint4/gtm-strategy.docx", 'size' => '2.5 MB'],
                ]],
            ],
            'Digital-marketing' => [
                ['name' => 'Sprint 1: Digital Marketing Fundamentals', 'materials' => [
                    ['title' => 'Introduction to Digital Marketing.pdf', 'type' => 'pdf', 'path' => "courses/Digital-marketing/sprint1/digital-marketing-intro.pdf", 'size' => '2.9 MB'],
                    ['title' => 'Marketing Channels Overview.pptx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint1/channels-overview.pptx", 'size' => '5.7 MB'],
                    ['title' => 'Customer Journey Mapping.docx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint1/customer-journey.docx", 'size' => '1.7 MB'],
                ]],
                ['name' => 'Sprint 2: SEO & Content Marketing', 'materials' => [
                    ['title' => 'SEO Complete Guide.pdf', 'type' => 'pdf', 'path' => "courses/Digital-marketing/sprint2/seo-guide.pdf", 'size' => '4.3 MB'],
                    ['title' => 'Content Marketing Strategy.pptx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint2/content-strategy.pptx", 'size' => '6.9 MB'],
                    ['title' => 'Keyword Research Template.docx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint2/keyword-research.docx", 'size' => '1.9 MB'],
                ]],
                ['name' => 'Sprint 3: Social Media & Paid Ads', 'materials' => [
                    ['title' => 'Social Media Marketing.pdf', 'type' => 'pdf', 'path' => "courses/Digital-marketing/sprint3/social-media.pdf", 'size' => '3.8 MB'],
                    ['title' => 'Facebook & Instagram Ads.pptx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint3/fb-insta-ads.pptx", 'size' => '7.4 MB'],
                    ['title' => 'Google Ads Campaign Setup.docx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint3/google-ads.docx", 'size' => '2.3 MB'],
                ]],
                ['name' => 'Sprint 4: Analytics & Conversion', 'materials' => [
                    ['title' => 'Google Analytics 4 Guide.pdf', 'type' => 'pdf', 'path' => "courses/Digital-marketing/sprint4/ga4-guide.pdf", 'size' => '4.6 MB'],
                    ['title' => 'Conversion Rate Optimization.pptx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint4/cro.pptx", 'size' => '6.2 MB'],
                    ['title' => 'Email Marketing Automation.docx', 'type' => 'document', 'path' => "courses/Digital-marketing/sprint4/email-automation.docx", 'size' => '2.1 MB'],
                ]],
            ],
            'Data-Analysis' => [
                ['name' => 'Sprint 1: Data Analysis Fundamentals', 'materials' => [
                    ['title' => 'Introduction to Data Analysis.pdf', 'type' => 'pdf', 'path' => "courses/Data-Analysis/sprint1/data-analysis-intro.pdf", 'size' => '2.6 MB'],
                    ['title' => 'Python for Data Analysis.pptx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint1/python-data.pptx", 'size' => '5.4 MB'],
                    ['title' => 'Statistical Concepts.docx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint1/statistics.docx", 'size' => '1.8 MB'],
                ]],
                ['name' => 'Sprint 2: Data Cleaning & SQL', 'materials' => [
                    ['title' => 'Data Cleaning Techniques.pdf', 'type' => 'pdf', 'path' => "courses/Data-Analysis/sprint2/data-cleaning.pdf", 'size' => '3.7 MB'],
                    ['title' => 'SQL Querying Masterclass.pptx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint2/sql-querying.pptx", 'size' => '6.3 MB'],
                    ['title' => 'Database Design Basics.docx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint2/database-design.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 3: Data Visualization', 'materials' => [
                    ['title' => 'Power BI Complete Guide.pdf', 'type' => 'pdf', 'path' => "courses/Data-Analysis/sprint3/powerbi-guide.pdf", 'size' => '4.8 MB'],
                    ['title' => 'Dashboard Design Principles.pptx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint3/dashboard-design.pptx", 'size' => '8.1 MB'],
                    ['title' => 'Matplotlib & Seaborn.docx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint3/visualization-libs.docx", 'size' => '2.4 MB'],
                ]],
                ['name' => 'Sprint 4: Advanced Analytics', 'materials' => [
                    ['title' => 'Predictive Modeling.pdf', 'type' => 'pdf', 'path' => "courses/Data-Analysis/sprint4/predictive-modeling.pdf", 'size' => '5.1 MB'],
                    ['title' => 'Machine Learning Basics.pptx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint4/ml-basics.pptx", 'size' => '7.6 MB'],
                    ['title' => 'Business Analytics Case Studies.docx', 'type' => 'document', 'path' => "courses/Data-Analysis/sprint4/case-studies.docx", 'size' => '2.9 MB'],
                ]],
            ],
            'Video-Editing' => [
                ['name' => 'Sprint 1: Video Editing Foundations', 'materials' => [
                    ['title' => 'Introduction to Video Editing.pdf', 'type' => 'pdf', 'path' => "courses/Video-Editing/sprint1/video-editing-intro.pdf", 'size' => '3.2 MB'],
                    ['title' => 'Adobe Premiere Pro Basics.pptx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint1/premiere-basics.pptx", 'size' => '9.4 MB'],
                    ['title' => 'Video Formats & Codecs.docx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint1/formats-codecs.docx", 'size' => '1.6 MB'],
                ]],
                ['name' => 'Sprint 2: Advanced Editing Techniques', 'materials' => [
                    ['title' => 'Color Grading Guide.pdf', 'type' => 'pdf', 'path' => "courses/Video-Editing/sprint2/color-grading.pdf", 'size' => '5.8 MB'],
                    ['title' => 'Audio Design & Mixing.pptx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint2/audio-design.pptx", 'size' => '7.2 MB'],
                    ['title' => 'Transition Techniques.docx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint2/transitions.docx", 'size' => '2.3 MB'],
                ]],
                ['name' => 'Sprint 3: Motion Graphics & Effects', 'materials' => [
                    ['title' => 'After Effects Fundamentals.pdf', 'type' => 'pdf', 'path' => "courses/Video-Editing/sprint3/after-effects.pdf", 'size' => '4.9 MB'],
                    ['title' => 'Motion Graphics Design.pptx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint3/motion-graphics.pptx", 'size' => '11.3 MB'],
                    ['title' => 'Green Screen Techniques.docx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint3/green-screen.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 4: Content Creation & Distribution', 'materials' => [
                    ['title' => 'Social Media Video Strategy.pdf', 'type' => 'pdf', 'path' => "courses/Video-Editing/sprint4/social-video.pdf", 'size' => '3.6 MB'],
                    ['title' => 'YouTube Content Creation.pptx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint4/youtube-content.pptx", 'size' => '8.7 MB'],
                    ['title' => 'Export & Optimization Settings.docx', 'type' => 'document', 'path' => "courses/Video-Editing/sprint4/export-settings.docx", 'size' => '1.9 MB'],
                ]],
            ],
            'Frontend-Development' => [
                ['name' => 'Sprint 1: HTML, CSS & JavaScript Basics', 'materials' => [
                    ['title' => 'HTML5 Complete Guide.pdf', 'type' => 'pdf', 'path' => "courses/Frontend-Development/sprint1/html5-guide.pdf", 'size' => '2.8 MB'],
                    ['title' => 'CSS3 & Flexbox.pptx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint1/css3-flexbox.pptx", 'size' => '6.7 MB'],
                    ['title' => 'JavaScript ES6+ Features.docx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint1/js-es6.docx", 'size' => '2.2 MB'],
                ]],
                ['name' => 'Sprint 2: Responsive Design & Git', 'materials' => [
                    ['title' => 'Responsive Web Design.pdf', 'type' => 'pdf', 'path' => "courses/Frontend-Development/sprint2/responsive-design.pdf", 'size' => '4.1 MB'],
                    ['title' => 'CSS Grid Mastery.pptx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint2/css-grid.pptx", 'size' => '7.9 MB'],
                    ['title' => 'Git & GitHub Workflow.docx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint2/git-workflow.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 3: React Fundamentals', 'materials' => [
                    ['title' => 'Introduction to React.pdf', 'type' => 'pdf', 'path' => "courses/Frontend-Development/sprint3/react-intro.pdf", 'size' => '3.9 MB'],
                    ['title' => 'React Hooks & State Management.pptx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint3/react-hooks.pptx", 'size' => '8.4 MB'],
                    ['title' => 'Component Architecture.docx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint3/component-architecture.docx", 'size' => '2.5 MB'],
                ]],
                ['name' => 'Sprint 4: Advanced React & Deployment', 'materials' => [
                    ['title' => 'API Integration with React.pdf', 'type' => 'pdf', 'path' => "courses/Frontend-Development/sprint4/api-integration.pdf", 'size' => '4.3 MB'],
                    ['title' => 'React Performance Optimization.pptx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint4/performance.pptx", 'size' => '7.2 MB'],
                    ['title' => 'Deployment with Vercel & Netlify.docx', 'type' => 'document', 'path' => "courses/Frontend-Development/sprint4/deployment.docx", 'size' => '1.8 MB'],
                ]],
            ],
            'Backend-Development' => [
                ['name' => 'Sprint 1: PHP & Laravel Fundamentals', 'materials' => [
                    ['title' => 'PHP 8 Complete Guide.pdf', 'type' => 'pdf', 'path' => "courses/Backend-Development/sprint1/php8-guide.pdf", 'size' => '3.4 MB'],
                    ['title' => 'Laravel Framework Basics.pptx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint1/laravel-basics.pptx", 'size' => '6.8 MB'],
                    ['title' => 'MVC Architecture Explained.docx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint1/mvc-architecture.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 2: Database & Eloquent ORM', 'materials' => [
                    ['title' => 'MySQL Database Design.pdf', 'type' => 'pdf', 'path' => "courses/Backend-Development/sprint2/mysql-design.pdf", 'size' => '4.2 MB'],
                    ['title' => 'Laravel Eloquent Mastery.pptx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint2/eloquent-mastery.pptx", 'size' => '7.6 MB'],
                    ['title' => 'Database Migrations & Seeders.docx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint2/migrations-seeders.docx", 'size' => '2.3 MB'],
                ]],
                ['name' => 'Sprint 3: RESTful APIs & Authentication', 'materials' => [
                    ['title' => 'Building RESTful APIs.pdf', 'type' => 'pdf', 'path' => "courses/Backend-Development/sprint3/restful-apis.pdf", 'size' => '3.8 MB'],
                    ['title' => 'JWT Authentication in Laravel.pptx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint3/jwt-auth.pptx", 'size' => '6.4 MB'],
                    ['title' => 'API Security Best Practices.docx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint3/api-security.docx", 'size' => '2.7 MB'],
                ]],
                ['name' => 'Sprint 4: Testing & Deployment', 'materials' => [
                    ['title' => 'PHPUnit Testing Guide.pdf', 'type' => 'pdf', 'path' => "courses/Backend-Development/sprint4/phpunit-testing.pdf", 'size' => '4.6 MB'],
                    ['title' => 'Laravel Deployment Strategies.pptx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint4/deployment-strategies.pptx", 'size' => '7.9 MB'],
                    ['title' => 'Production Server Setup.docx', 'type' => 'document', 'path' => "courses/Backend-Development/sprint4/server-setup.docx", 'size' => '2.4 MB'],
                ]],
            ],
            'Leadership-Training' => [
                ['name' => 'Sprint 1: Communication & Emotional Intelligence', 'materials' => [
                    ['title' => 'Effective Communication Skills.pdf', 'type' => 'pdf', 'path' => "courses/Leadership-Training/sprint1/communication-skills.pdf", 'size' => '2.4 MB'],
                    ['title' => 'Emotional Intelligence Workshop.pptx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint1/emotional-intelligence.pptx", 'size' => '5.9 MB'],
                    ['title' => 'Active Listening Techniques.docx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint1/active-listening.docx", 'size' => '1.6 MB'],
                ]],
                ['name' => 'Sprint 2: Leadership & Team Building', 'materials' => [
                    ['title' => 'Leadership Fundamentals.pdf', 'type' => 'pdf', 'path' => "courses/Leadership-Training/sprint2/leadership-fundamentals.pdf", 'size' => '3.1 MB'],
                    ['title' => 'Team Building Strategies.pptx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint2/team-building.pptx", 'size' => '6.8 MB'],
                    ['title' => 'Motivation & Delegation.docx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint2/motivation-delegation.docx", 'size' => '1.9 MB'],
                ]],
                ['name' => 'Sprint 3: Conflict Resolution & Critical Thinking', 'materials' => [
                    ['title' => 'Conflict Resolution Techniques.pdf', 'type' => 'pdf', 'path' => "courses/Leadership-Training/sprint3/conflict-resolution.pdf", 'size' => '2.8 MB'],
                    ['title' => 'Critical Thinking & Problem Solving.pptx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint3/critical-thinking.pptx", 'size' => '7.2 MB'],
                    ['title' => 'Negotiation Skills.docx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint3/negotiation.docx", 'size' => '2.1 MB'],
                ]],
                ['name' => 'Sprint 4: Career Development & Professional Growth', 'materials' => [
                    ['title' => 'Career Planning Workbook.pdf', 'type' => 'pdf', 'path' => "courses/Leadership-Training/sprint4/career-planning.pdf", 'size' => '3.3 MB'],
                    ['title' => 'Public Speaking & Presentation.pptx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint4/public-speaking.pptx", 'size' => '8.6 MB'],
                    ['title' => 'Time Management & Productivity.docx', 'type' => 'document', 'path' => "courses/Leadership-Training/sprint4/time-management.docx", 'size' => '2.2 MB'],
                ]],
            ],
        ];

        return $sprintTemplates[$courseId] ?? [];
    }

    private function getResourcesForCourse(string $courseId): array
    {
        // Generic resources that apply to all courses
        $resources = [
            'video_tutorials' => [
                ['title' => 'Getting Started with ' . $courseId, 'description' => 'Complete beginner guide', 'url' => 'https://youtube.com/watch?v=example1', 'source' => 'YouTube', 'duration' => '45:00'],
                ['title' => 'Advanced Techniques', 'description' => 'Deep dive into advanced concepts', 'url' => 'https://youtube.com/watch?v=example2', 'source' => 'YouTube', 'duration' => '1:20:00'],
                ['title' => 'Best Practices', 'description' => 'Industry best practices and tips', 'url' => 'https://youtube.com/watch?v=example3', 'source' => 'YouTube', 'duration' => '38:00'],
            ],
            'industry_articles' => [
                ['title' => 'The Future of ' . $courseId, 'description' => 'Industry trends and predictions', 'url' => 'https://example.com/article1', 'source' => 'TechCrunch'],
                ['title' => 'Case Study: Success Stories', 'description' => 'Real-world implementations', 'url' => 'https://example.com/article2', 'source' => 'Medium'],
                ['title' => 'Top 10 Tools for ' . $courseId, 'description' => 'Essential tools and resources', 'url' => 'https://example.com/article3', 'source' => 'Dev.to'],
            ],
            'recommended_reading' => [
                ['title' => 'Official Documentation', 'description' => 'Complete reference guide', 'url' => 'https://docs.example.com', 'source' => 'Official Docs'],
                ['title' => 'Community Forum', 'description' => 'Get help from the community', 'url' => 'https://community.example.com', 'source' => 'Community'],
                ['title' => 'Weekly Newsletter', 'description' => 'Stay updated with latest news', 'url' => 'https://newsletter.example.com', 'source' => 'Newsletter'],
            ],
        ];

        return $resources;
    }

    private function createCohortParticipants(int $cohortId): void
    {
        // Get random users or create sample data
        $sampleParticipants = [
            ['name' => 'John Doe', 'email' => 'john.doe@example.com'],
            ['name' => 'Jane Smith', 'email' => 'jane.smith@example.com'],
            ['name' => 'Mike Johnson', 'email' => 'mike.johnson@example.com'],
            ['name' => 'Sarah Williams', 'email' => 'sarah.williams@example.com'],
            ['name' => 'David Brown', 'email' => 'david.brown@example.com'],
        ];

        foreach ($sampleParticipants as $index => $participant) {
            // Find or create user
            $user = User::firstOrCreate(
                ['email' => $participant['email']],
                [
                    'name' => $participant['name'],
                    'password' => bcrypt('password'), // Default password
                ]
            );
            
            // Generate random sprint scores
            $sprint1 = rand(70, 100);
            $sprint2 = rand(70, 100);
            $sprint3 = rand(70, 100);
            $sprint4 = rand(70, 100);
            $overall = ($sprint1 + $sprint2 + $sprint3 + $sprint4) / 4;
            
            CohortParticipant::create([
                'cohort_leaderboard_id' => $cohortId,
                'user_id' => $user->id,
                'rank' => $index + 1,
                'sprint1_score' => $sprint1,
                'sprint2_score' => $sprint2,
                'sprint3_score' => $sprint3,
                'sprint4_score' => $sprint4,
                'overall_score' => round($overall, 2),
            ]);
        }
    }
}