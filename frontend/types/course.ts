// types/course.ts
export interface Course {
  id: string;
  title: string;
  project: string;
  description: string;
  heroImage: string;
  secondaryImage: string;
  price: number;
  tools: { name: string; icon: string }[];
  whatYouWillLearn: string[];
  keyBenefits: { title: string; text: string }[];
  careerPath: {
    entry: string[];
    mid: string[];
    advanced: string[];
    specialized: string[];
  };
  industries: { title: string; text: string }[];
  salary: {
    entry: string;
    mid: string;
    senior: string;
  };

  // ✅ Add these optional fields to support courses that have them:
  duration?: string;
  level?: string;
}
