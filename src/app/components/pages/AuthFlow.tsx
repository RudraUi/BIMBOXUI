import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Check, 
  ChevronLeft, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  User, 
  Briefcase, 
  ArrowRight,
  Sparkles,
  Smartphone,
  Globe,
  CheckCircle,
  HelpCircle,
  Users
} from "lucide-react";

// Country list for the phone code selector
interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const COUNTRIES: Country[] = [
  { code: "IN", dialCode: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AE", dialCode: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "SG", dialCode: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "AU", dialCode: "+61", flag: "🇦🇺", name: "Australia" },
];

type FlowType = "owner" | "member" | "forgot";

type AuthStep = 
  // Owner Flow Steps
  | "owner_signin" 
  | "owner_signup" 
  | "owner_otp" 
  | "owner_basic_info" 
  | "owner_completed"
  // Member Flow Steps
  | "member_accept"
  | "member_otp_password"
  | "member_profile"
  | "member_completed"
  // Forgot Password Steps
  | "forgot_request"
  | "forgot_otp"
  | "forgot_reset"
  | "forgot_completed";

const SERVICES_SHOWCASE = [
  {
    title: "Project Management",
    subtitle: "SELECTED SERVICE",
    tagline: "Manage teams, tasks, and deliverables in one place.",
    benefits: [
      "Centralize schedules, tasks, and team updates.",
      "Track deliverables and milestones across active work.",
      "Keep project status visible for every stakeholder."
    ],
    badges: ["Team planning", "Task tracking", "Delivery control"],
    steps: [
      { num: "01", title: "Select", desc: "Choose service" },
      { num: "02", title: "Input", desc: "Share details" },
      { num: "03", title: "Output", desc: "Receive result" }
    ]
  },
  {
    title: "3D BIM Viewer",
    subtitle: "SELECTED SERVICE",
    tagline: "Interactive multi-dimensional model inspection.",
    benefits: [
      "Visualize large architectural models directly in browser.",
      "Inspect detailed metadata, properties, and components.",
      "Execute side-by-side model version comparison in real-time."
    ],
    badges: ["WebGL Rendering", "Model Inspect", "Split Comparison"],
    steps: [
      { num: "01", title: "Upload", desc: "IFC / Revit file" },
      { num: "02", title: "Process", desc: "Cloud translation" },
      { num: "03", title: "Inspect", desc: "Explore in 3D" }
    ]
  },
  {
    title: "Clash Detection",
    subtitle: "SELECTED SERVICE",
    tagline: "Automated spatial clash coordination pipeline.",
    benefits: [
      "Identify spatial conflicts across MEP, structural & HVAC.",
      "Assign detected clashes directly to design coordinators.",
      "Track resolve progress and sync changes automatically."
    ],
    badges: ["Automated Scan", "Clash Assignment", "MEP Sync"],
    steps: [
      { num: "01", title: "Upload", desc: "Multi-discipline models" },
      { num: "02", title: "Scan", desc: "Run clash query" },
      { num: "03", title: "Resolve", desc: "Coordinate edits" }
    ]
  },
  {
    title: "LOD Progression",
    subtitle: "SELECTED SERVICE",
    tagline: "Monitor model development standard compliance.",
    benefits: [
      "Track asset development stages from LOD 100 to LOD 400.",
      "Generate automated material quantity takeoff reports.",
      "Verify model compliance with Project Execution Plans."
    ],
    badges: ["LOD 400 Compliance", "Quantity Takeoff", "BIM Validation"],
    steps: [
      { num: "01", title: "Map Goals", desc: "Define target LOD" },
      { num: "02", title: "Extract", desc: "Fetch component counts" },
      { num: "03", title: "Report", desc: "Audit data output" }
    ]
  }
];

export default function AuthFlow() {
  const [activeFlow, setActiveFlow] = useState<FlowType>("owner");
  const [step, setStep] = useState<AuthStep>("owner_signin");
  const [previousStep, setPreviousStep] = useState<AuthStep>("owner_signin");
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);

  // Loop through slides every 6 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SERVICES_SHOWCASE.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  // Loop through sub-steps within the active slide every 2 seconds
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveSubStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(stepInterval);
  }, []);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Signup State
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isSignUpPasswordFocused, setIsSignUpPasswordFocused] = useState(false);
  const [isMemberPasswordFocused, setIsMemberPasswordFocused] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  // OTP State
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes

  // Basic Info State (Owner)
  const [orgName, setOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companySize, setCompanySize] = useState("0-25");
  const [industry, setIndustry] = useState("Construction");
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  // Member Flow Specific States
  const [invitedEmail, setInvitedEmail] = useState("you@company.com");
  const [memberPassword, setMemberPassword] = useState("");
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberFullName, setMemberFullName] = useState("");
  const [memberDesignation, setMemberDesignation] = useState("");
  const [memberRole, setMemberRole] = useState("Member");
  const [memberTeam, setMemberTeam] = useState("Architecture");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Forgot Password Flow States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Background timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isOtpStep = step === "owner_otp" || step === "member_otp_password" || step === "forgot_otp";
    if (isOtpStep && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  const renderPasswordStrengthChecklist = (val: string, isFocused: boolean) => {
    if (!val || !isFocused) return null;
    
    const lengthValid = val.length >= 8;
    const upperValid = /[A-Z]/.test(val);
    const specNumValid = /[0-9\W]/.test(val);
    
    const metCount = [lengthValid, upperValid, specNumValid].filter(Boolean).length;
    
    let strengthColor = "bg-slate-200";
    let strengthText = "Weak";
    let strengthWidth = "w-1/3";
    
    if (metCount === 2) {
      strengthColor = "bg-amber-400";
      strengthText = "Medium";
      strengthWidth = "w-2/3";
    } else if (metCount === 3) {
      strengthColor = "bg-emerald-500";
      strengthText = "Strong";
      strengthWidth = "w-full";
    } else if (metCount === 1) {
      strengthColor = "bg-rose-500";
      strengthText = "Very Weak";
      strengthWidth = "w-1/4";
    }

    return (
      <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Password strength</span>
          <span className={metCount === 3 ? "text-emerald-600" : metCount === 2 ? "text-amber-500" : "text-rose-500"}>
            {strengthText}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300`} />
        </div>

        <div className="grid grid-cols-1 gap-1 text-xs font-semibold text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${lengthValid ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className={lengthValid ? "text-emerald-600 line-through decoration-emerald-200" : ""}>Min. 8 characters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${upperValid ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className={upperValid ? "text-emerald-600 line-through decoration-emerald-200" : ""}>At least one uppercase letter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${specNumValid ? "bg-emerald-500" : "bg-slate-300"}`} />
            <span className={specNumValid ? "text-emerald-600 line-through decoration-emerald-200" : ""}>At least one number or symbol</span>
          </div>
        </div>
      </div>
    );
  };

  // Reset OTP values when arriving on the OTP screen
  useEffect(() => {
    const isOtpStep = step === "owner_otp" || step === "member_otp_password" || step === "forgot_otp";
    if (isOtpStep) {
      setOtpValues(Array(6).fill(""));
      setTimerSeconds(300);
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [step]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteValues = pasteData.split("");
      setOtpValues(pasteValues);
      otpInputsRef.current[5]?.focus();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const navigateTo = (newStep: AuthStep) => {
    setErrorMsg(null);
    setFieldErrors({});
    setPreviousStep(step);
    setStep(newStep);
  };

  // FLOW ACTIONS - OWNER FLOW
  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("demo.user@gmail.com");
      navigateTo("owner_completed");
    }, 1000);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!email) {
      errs.email = "Please enter your work email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Please enter your password.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please correct the validation errors below.");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("owner_completed");
    }, 800);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!email) {
      errs.email = "Please enter your work email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!phone) {
      errs.phone = "Please enter your contact number.";
    } else if (phone.length < 8) {
      errs.phone = "Contact number must be at least 8 digits.";
    }
    if (!password) {
      errs.password = "Please choose a password.";
    } else {
      const lengthValid = password.length >= 8;
      const upperValid = /[A-Z]/.test(password);
      const specNumValid = /[0-9\W]/.test(password);
      if (!lengthValid || !upperValid || !specNumValid) {
        errs.password = "Password does not meet all safety requirements.";
      }
    }
    if (!agreeTerms) {
      errs.agreeTerms = "You must agree to the Terms and Privacy policy.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please correct the validation errors below.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("owner_otp");
    }, 800);
  };

  const handleOwnerOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const code = otpValues.join("");
    if (code.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      const errs = { otp: "Please enter the complete 6-digit code." };
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (previousStep === "owner_signin") {
        navigateTo("owner_completed");
      } else {
        navigateTo("owner_basic_info");
      }
    }, 800);
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!orgName) {
      errs.orgName = "Please enter your organization name.";
    }
    if (!firstName) {
      errs.firstName = "Please enter your first name.";
    }
    if (!lastName) {
      errs.lastName = "Please enter your last name.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please fill in all basic information fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("owner_completed");
    }, 1000);
  };

  // FLOW ACTIONS - MEMBER FLOW
  const handleAcceptInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!invitedEmail) {
      errs.invitedEmail = "Invited email is required.";
    } else if (!/\S+@\S+\.\S+/.test(invitedEmail)) {
      errs.invitedEmail = "Please enter a valid email address.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("member_otp_password");
    }, 800);
  };

  const handleMemberOtpPasswordVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    const code = otpValues.join("");
    if (code.length < 6) {
      errs.otp = "Please enter the complete 6-digit code.";
    }
    if (!memberPassword) {
      errs.memberPassword = "Please set a password.";
    } else if (memberPassword.length < 6) {
      errs.memberPassword = "Password must be at least 6 characters.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please correct the validation errors below.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("member_profile");
    }, 800);
  };

  const handleMemberProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!memberFullName) {
      errs.memberFullName = "Please enter your full name.";
    }
    if (!memberDesignation) {
      errs.memberDesignation = "Please enter your designation.";
    }
    if (!phone) {
      errs.phone = "Please enter your contact number.";
    } else if (phone.length < 8) {
      errs.phone = "Contact number must be at least 8 digits.";
    }
    if (!agreeTerms) {
      errs.agreeTerms = "You must agree to the Terms and Privacy policy.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please correct the validation errors below.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("member_completed");
    }, 1000);
  };

  // FLOW ACTIONS - FORGOT PASSWORD FLOW
  const handleForgotRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!email) {
      errs.email = "Please enter your work email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("forgot_otp");
    }, 800);
  };

  const handleForgotOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const code = otpValues.join("");
    if (code.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      const errs = { otp: "Please enter the complete 6-digit code." };
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("forgot_reset");
    }, 800);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg(null);
    const errs: Record<string, string> = {};
    if (!newPassword) {
      errs.newPassword = "Please enter a new password.";
    } else if (newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters.";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setErrorMsg("Please correct the validation errors below.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigateTo("forgot_completed");
    }, 1000);
  };

  const handleResendOtp = () => {
    setTimerSeconds(300);
    setOtpValues(Array(6).fill(""));
    setErrorMsg(null);
    if (otpInputsRef.current[0]) {
      otpInputsRef.current[0].focus();
    }
  };

  // Quick switch of flow type resets to the first step of that flow
  const switchFlow = (flow: FlowType) => {
    setActiveFlow(flow);
    setErrorMsg(null);
    if (flow === "owner") {
      setStep("owner_signin");
    } else if (flow === "member") {
      setStep("member_accept");
    } else if (flow === "forgot") {
      setStep("forgot_request");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFCFF] flex flex-col-reverse lg:flex-row-reverse relative font-sans overflow-x-hidden antialiased select-none">
      
      {/* 1. RIGHT COLUMN (on desktop): Stunning 3D organic architectural visual & branding */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#E0EEFF] via-[#F4F9FF] to-[#FFFFFF] flex flex-col justify-between items-center px-8 py-16 lg:px-16 lg:py-20 relative overflow-hidden shrink-0 border-l border-[#EAF2FC]">
        
        {/* Subtle decorative circles for depth */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] aspect-square rounded-full bg-blue-300/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-30%] w-[70%] aspect-square rounded-full bg-cyan-200/25 blur-[100px] pointer-events-none" />

        {/* Brand Logo & Tagline (Commented out for now; included in image) */}
        {false && (
          <div className="relative z-10 text-center animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="flex items-center justify-center text-4xl lg:text-[44px] font-extrabold tracking-tight select-none">
              <span className="text-[#1E56EC] font-black">BIMBOX</span>
              <span className="text-[#4092FF] tracking-wide">.AI</span>
            </div>
            <div className="mt-3 text-xs lg:text-[13px] font-bold tracking-wider flex items-center justify-center gap-1.5 uppercase select-none">
              <span className="text-[#1E56EC]/70">AI Based Digital Twin</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E78A3A]" />
              <span className="text-[#E78A3A] font-extrabold">Solution</span>
            </div>
          </div>
        )}

        {/* Auth Building Image (shown instead of animation showcase for now) */}
        <div className="w-full max-w-[460px] my-auto relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
          <img 
            src="/images/auth_building.png" 
            alt="BIMBOX AI Digital Twin Solution" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Dynamic Service & Benefit Loop Showcase (Commented out for now) */}
        {false && (
          <div className="w-full max-w-[400px] lg:max-w-[440px] flex flex-col justify-center my-auto relative z-10 text-left pt-8 select-none">
            
            {/* Active Slide Content */}
            <div key={activeSlide} className="animate-in fade-in slide-in-from-right-4 duration-500">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#1E56EC] mb-2 block">
                {SERVICES_SHOWCASE[activeSlide].subtitle}
              </span>
              
              <h2 className="text-[32px] font-bold text-[#0F172A] tracking-tight leading-none mb-3">
                {SERVICES_SHOWCASE[activeSlide].title}
              </h2>
              
              <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-8">
                {SERVICES_SHOWCASE[activeSlide].tagline}
              </p>
              
              <h3 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-6">
                Core Benefits
              </h3>
              
              <div className="relative pl-12 space-y-6">
                {/* Vertical line connecting the numbers */}
                <div className="absolute left-[17px] top-[14px] bottom-[14px] w-[2px] bg-[#E9EFF6]" />
                
                {SERVICES_SHOWCASE[activeSlide].benefits.map((benefit, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Number Badge */}
                    <div className={`absolute -left-12 w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm bg-white shadow-sm transition-all duration-300
                      ${idx === activeSubStep 
                        ? "border-[#1E56EC] text-[#1E56EC] ring-4 ring-blue-50/70 scale-105" 
                        : "border-[#EAF2FC] text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {/* Benefit Content */}
                    <p className={`text-[13px] font-semibold leading-relaxed pt-1.5 transition-all duration-300
                      ${idx === activeSubStep ? "text-[#0F172A]" : "text-slate-400"}`}
                    >
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-8">
                {SERVICES_SHOWCASE[activeSlide].badges.map((badge, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 rounded-full border border-[#E9EFF6] bg-white/70 text-[11px] font-bold text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    {badge}
                  </span>
                ))}
              </div>

              {/* HOW IT WORKS card */}
              <div className="w-full mt-10 bg-white/80 backdrop-blur-sm border border-[#E9EFF6] rounded-[24px] p-5 shadow-[0_12px_36px_-8px_rgba(30,86,236,0.03)] relative overflow-hidden transition-all hover:bg-white hover:shadow-[0_16px_48px_-12px_rgba(30,86,236,0.06)]">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    How It Works
                  </span>
                  <span className={`w-2 h-2 rounded-full bg-[#1E56EC] transition-all duration-300 ${activeSubStep === 0 ? "scale-125 opacity-100 shadow-[0_0_12px_#1E56EC]" : "opacity-80"}`} />
                </div>

                {/* Horizontal progress steps */}
                <div className="relative flex justify-between items-start">
                  {/* Connecting background progress line */}
                  <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#EAF2FC] -z-10" />
                  
                  {/* Animated filled progress line */}
                  <div 
                    className="absolute top-4 left-6 h-[2px] bg-[#1E56EC] -z-10 transition-all duration-500 ease-out"
                    style={{ width: `${(activeSubStep / 2) * 80 + 5}%` }}
                  />

                  {SERVICES_SHOWCASE[activeSlide].steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center flex-1 relative">
                      {/* Step number badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300
                        ${idx <= activeSubStep 
                          ? "bg-white border-[#1E56EC] text-[#1E56EC] shadow-md shadow-blue-500/10 scale-105" 
                          : "bg-white border-[#E9EFF6] text-slate-400 shadow-sm"
                        }`}
                      >
                        {step.num}
                      </div>
                      
                      {/* Step text info */}
                      <span className={`mt-3 text-[11px] font-extrabold transition-all duration-300
                        ${idx === activeSubStep ? "text-[#0F172A]" : "text-slate-400"}`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-1 text-[9px] font-semibold text-slate-400 max-w-[85px]">
                        {step.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bottom border representation like the dark line in screenshots */}
        <div className="absolute bottom-0 inset-x-0 h-2 bg-[#1A1E24] hidden lg:block" />

        {/* 3. INTERACTIVE PRESENTATION CONTROLS (Demo Flow Switcher) */}
        <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-2.5 rounded-[18px] border border-blue-100/40 shadow-[0_8px_24px_rgba(30,86,236,0.06)] flex flex-col gap-2 w-[220px] transition-all hover:bg-white hover:shadow-[0_12px_32px_rgba(30,86,236,0.08)] animate-in fade-in duration-300">
          
          {/* Navigator Header */}
          <div className="flex items-center justify-between border-b border-[#F0F5FA] pb-1.5">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1E56EC] animate-pulse" />
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 select-none">Auth Navigator</span>
            </div>
            <span className="text-[8px] text-[#1E56EC] font-black bg-blue-50 px-1.5 py-0.5 rounded uppercase select-none">
              {activeFlow}
            </span>
          </div>

          {/* Tab selector for Flow type */}
          <div className="grid grid-cols-3 gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
            {(["owner", "member", "forgot"] as const).map((flow) => (
              <button
                key={flow}
                type="button"
                onClick={() => switchFlow(flow)}
                className={`py-1 rounded-md text-[8px] font-bold transition-all cursor-pointer capitalize
                  ${activeFlow === flow 
                    ? "bg-white text-[#1E56EC] shadow-[0_2px_4px_rgba(30,86,236,0.08)] font-black" 
                    : "text-slate-500 hover:text-slate-800"
                  }
                `}
              >
                {flow === "forgot" ? "Forgot" : flow}
              </button>
            ))}
          </div>

          {/* Dynamic Buttons for specific steps in selected flow */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1">
              
              {/* Steps for Owner Flow */}
              {activeFlow === "owner" && (
                <>
                  {([
                    { id: "owner_signin", label: "1" },
                    { id: "owner_signup", label: "2" },
                    { id: "owner_otp", label: "3" },
                    { id: "owner_basic_info", label: "4" },
                    { id: "owner_completed", label: "5" }
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigateTo(s.id)}
                      className={`w-[26px] h-[26px] rounded-md text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center
                        ${step === s.id 
                          ? "bg-[#1E56EC] text-white font-black shadow-sm" 
                          : "bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }
                      `}
                      title={s.id.replace("owner_", "").replace("_", " ")}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

              {/* Steps for Member Flow */}
              {activeFlow === "member" && (
                <>
                  {([
                    { id: "member_accept", label: "1" },
                    { id: "member_otp_password", label: "2" },
                    { id: "member_profile", label: "3" },
                    { id: "member_completed", label: "4" }
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigateTo(s.id)}
                      className={`w-[26px] h-[26px] rounded-md text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center
                        ${step === s.id 
                          ? "bg-[#1E56EC] text-white font-black shadow-sm" 
                          : "bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }
                      `}
                      title={s.id.replace("member_", "").replace("_", " ")}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

              {/* Steps for Forgot Password Flow */}
              {activeFlow === "forgot" && (
                <>
                  {([
                    { id: "forgot_request", label: "1" },
                    { id: "forgot_otp", label: "2" },
                    { id: "forgot_reset", label: "3" },
                    { id: "forgot_completed", label: "4" }
                  ] as const).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigateTo(s.id)}
                      className={`w-[26px] h-[26px] rounded-md text-[9px] font-bold transition-all cursor-pointer flex items-center justify-center
                        ${step === s.id 
                          ? "bg-[#1E56EC] text-white font-black shadow-sm" 
                          : "bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }
                      `}
                      title={s.id.replace("forgot_", "").replace("_", " ")}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* 2. LEFT COLUMN (on desktop): Centered elegant card view based on active step */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-16 lg:py-20 relative bg-[#FCFDFF] min-h-[60vh] lg:min-h-screen">
        
        {/* Soft background glow */}
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-50/40 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[360px] bg-white border border-[#E9EFF6] rounded-[28px] p-6 lg:p-7 shadow-[0_16px_48px_-12px_rgba(30,86,236,0.05)] relative z-10 transition-all duration-300 hover:shadow-[0_24px_64px_-16px_rgba(30,86,236,0.08)]">
          
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <div className="flex-1 text-left">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600 font-bold ml-auto text-xs px-1">✕</button>
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW 1: OWNER SETUP FLOW STEPS                               */}
          {/* ============================================================ */}
          
          {/* STEP 1A: OWNER SIGN IN */}
          {step === "owner_signin" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-4">Sign in</h2>
              
              {/* External Login Methods */}
              <div>
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-10 border border-[#E2E8F0] hover:bg-[#F8FAFC] active:bg-[#F1F5F9] rounded-full text-xs font-semibold text-[#334155] flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* OR Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-[1px] bg-[#E2E8F0]" />
                <span className="px-3 text-[10px] uppercase font-bold text-slate-450 tracking-wider">OR</span>
                <div className="flex-1 h-[1px] bg-[#E2E8F0]" />
              </div>

              {/* Form */}
              <form onSubmit={handleSignInSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Work Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.email 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-655">Password</label>
                    <button
                      type="button"
                      onClick={() => switchFlow("forgot")}
                      className="text-xs font-semibold text-[#1E56EC] hover:underline cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.password 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 px-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Login with OTP */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E2E8F0] text-[#1E56EC] focus:ring-[#1E56EC]/30"
                    />
                    <span className="text-xs font-semibold text-slate-500">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setFieldErrors({});
                      setErrorMsg(null);
                      if (!email) {
                        setFieldErrors({ email: "Please enter your email to receive OTP." });
                        setErrorMsg("Please enter email address to receive OTP.");
                        return;
                      }
                      setPreviousStep("owner_signin");
                      navigateTo("owner_otp");
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    Login with OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </form>

              {/* Footer navigation */}
              <div className="text-center mt-6">
                <p className="text-[11px] font-bold text-slate-400">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => navigateTo("owner_signup")} 
                    className="text-[#1E56EC] font-extrabold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STEP 1B: OWNER SIGN UP */}
          {step === "owner_signup" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-4">Create account</h2>
              
              <form onSubmit={handleSignUpSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Work Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.email 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Contact number</label>
                  <div className="flex gap-2 relative">
                    
                    {/* Country Dial Code Dropdown Selector */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-850 flex items-center gap-1.5 transition-all select-none cursor-pointer"
                      >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="text-[13px] font-medium text-slate-600">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {showCountryDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                          <div className="absolute top-[110%] left-0 w-52 bg-white border border-[#E9EFF6] rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 hover:text-slate-900 transition-all flex items-center gap-2.5 cursor-pointer"
                              >
                                <span className="text-lg leading-none">{country.flag}</span>
                                <span className="font-semibold">{country.dialCode}</span>
                                <span className="text-[10px] text-slate-400 font-medium truncate flex-1">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Phone Input field */}
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="5347668769"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                          ${fieldErrors.phone 
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                            : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                          }
                        `}
                      />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </div>
                  )}
                </div>

                {/* Choose password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Choose password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsSignUpPasswordFocused(true)}
                      onBlur={() => setIsSignUpPasswordFocused(false)}
                      className={`w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.password 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 px-1"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                  {renderPasswordStrengthChecklist(password, isSignUpPasswordFocused)}
                </div>

                {/* Terms agreement checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className={`w-4 h-4 mt-0.5 rounded border focus:ring-2
                        ${fieldErrors.agreeTerms 
                          ? "border-rose-450 text-rose-550 focus:ring-rose-200 animate-shake" 
                          : "border-[#E2E8F0] text-[#1E56EC] focus:ring-[#1E56EC]/30"
                        }
                      `}
                    />
                    <span className="text-xs font-semibold text-slate-500 leading-normal">
                      I agree to the{" "}
                      <a href="#terms" className="text-[#1E56EC] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#privacy" className="text-[#1E56EC] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Privacy
                      </a>
                    </span>
                  </label>
                  {fieldErrors.agreeTerms && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.agreeTerms}</span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>

              {/* Footer navigation */}
              <div className="text-center mt-4">
                <p className="text-[11px] font-bold text-slate-400">
                  Already have an account?{" "}
                  <button 
                    onClick={() => navigateTo("owner_signin")} 
                    className="text-[#1E56EC] font-extrabold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STEP 1C: OWNER OTP */}
          {step === "owner_otp" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Enter code</h2>
                <button
                  type="button"
                  onClick={() => navigateTo(previousStep)}
                  className="w-9 h-9 border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed mb-4">
                We sent a 6-digit code to <span className="text-[#1E56EC] font-bold">{email || "get@bimbox.com"}</span>
              </p>

              {/* Code Inputs */}
              <form onSubmit={handleOwnerOtpVerify} noValidate className="space-y-4">
                <div className="flex justify-between gap-1.5">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={handleOtpPaste}
                      className={`w-[44px] h-[44px] lg:w-[45px] lg:h-[45px] text-center text-base font-bold rounded-xl border transition-all duration-200 outline-none hover:scale-[1.03] active:scale-[0.97]
                        ${fieldErrors.otp
                          ? "bg-rose-50/5 border-rose-400 text-rose-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-100/50 animate-shake"
                          : val 
                            ? "bg-[#1E56EC] border-[#1E56EC] text-white font-extrabold shadow-sm scale-105" 
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-slate-800 focus:border-[#1E56EC] focus:bg-white focus:ring-4 focus:ring-blue-50/50"
                        }
                      `}
                    />
                  ))}
                </div>
                {fieldErrors.otp && (
                  <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                    <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                    <span>{fieldErrors.otp}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Verify and continue</span>
                  )}
                </button>
              </form>

              {/* Resend actions */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-xs font-semibold text-slate-450">
                  Didn't receive it?{" "}
                  <button onClick={handleResendOtp} className="text-[#1E56EC] font-bold hover:underline cursor-pointer">
                    Resend code
                  </button>
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Code expires in {formatTimer(timerSeconds)} minutes.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1D: OWNER BASIC INFO */}
          {step === "owner_basic_info" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-4">Basic information</h2>
              
              <form onSubmit={handleBasicInfoSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Organization name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="eg: BIMBOX"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.orgName 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.orgName && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.orgName}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-655 mb-1.5">First name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                          ${fieldErrors.firstName 
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                            : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                          }
                        `}
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                        <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                        <span>{fieldErrors.firstName}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-655 mb-1.5">Last name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                          ${fieldErrors.lastName 
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                            : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                          }
                        `}
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                        <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                        <span>{fieldErrors.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Company details</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-650 mb-1.5">Company size</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSizeDropdown(!showSizeDropdown);
                        setShowIndustryDropdown(false);
                      }}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-[13px] font-medium text-slate-700 flex items-center justify-between transition-all select-none cursor-pointer"
                    >
                      <span>{companySize}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                    
                    {showSizeDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSizeDropdown(false)} />
                        <div className="absolute top-[105%] inset-x-0 bg-white border border-[#E9EFF6] rounded-xl p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          {["0-25", "26-100", "101-500", "500+"].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                setCompanySize(sz);
                                setShowSizeDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 hover:text-slate-900 transition-all cursor-pointer"
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-650 mb-1.5">Select industry</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowIndustryDropdown(!showIndustryDropdown);
                        setShowSizeDropdown(false);
                      }}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-[13px] font-medium text-slate-700 flex items-center justify-between transition-all select-none cursor-pointer"
                    >
                      <span className="truncate">{industry}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                    
                    {showIndustryDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowIndustryDropdown(false)} />
                        <div className="absolute top-[105%] inset-x-0 bg-white border border-[#E9EFF6] rounded-xl p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          {["Construction", "Real Estate", "Architecture", "Engineering", "Digital Twin", "Other"].map((ind) => (
                            <button
                              key={ind}
                              type="button"
                              onClick={() => {
                                setIndustry(ind);
                                setShowIndustryDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 hover:text-slate-900 transition-all cursor-pointer"
                            >
                              {ind}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Complete setup</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 1E: OWNER COMPLETED */}
          {step === "owner_completed" && (
            <div className="text-center py-4 animate-in fade-in scale-in duration-300">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-[#1E56EC] rounded-full flex items-center justify-center shadow-[0_0_36px_rgba(30,86,236,0.35)] animate-bounce-slow relative">
                  <div className="absolute inset-0 rounded-full bg-[#1E56EC]/20 animate-ping opacity-75" />
                  <Check className="w-9 h-9 text-white stroke-[3.5] relative z-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Setup Completed</h2>
              <p className="text-xs font-semibold text-slate-400 mb-8 leading-relaxed max-w-[280px] mx-auto">
                Your account and workspace are ready. Enjoy the digital twin solution.
              </p>

              <button
                type="button"
                onClick={() => { window.location.href = "/dashboard"; }}
                className="w-full h-11 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore app</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW 2: MEMBER INVITATION FLOW STEPS                         */}
          {/* ============================================================ */}
          
          {/* STEP 2A: MEMBER ACCEPT INVITATION */}
          {step === "member_accept" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-2">Accept Invitation</h2>
              <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed mb-4">
                You were invited as Member to <a href="#estate" className="text-[#1E56EC] font-bold hover:underline">Z Estate</a>.
              </p>

              <form onSubmit={handleAcceptInviteSubmit} noValidate className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Invited Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={invitedEmail}
                      onChange={(e) => setInvitedEmail(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.invitedEmail 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.invitedEmail && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.invitedEmail}</span>
                    </div>
                  )}
                </div>

                {/* Decline / Continue Buttons Row */}
                <div className="grid grid-cols-2 gap-4 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Invitation declined.");
                      switchFlow("owner");
                    }}
                    className="h-10 border border-[#E2E8F0] hover:bg-slate-50 text-[#334155] rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                  >
                    Decline
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 bg-[#1E56EC] hover:bg-[#1546C7] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Continue</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Invitation footer text */}
              <div className="mt-8 text-[11px] font-bold text-slate-400 leading-normal text-left">
                This invite link expires in 24 hours. Only Z Estate admin can see your basic info.
              </div>
            </div>
          )}

          {/* STEP 2B: MEMBER OTP & SET PASSWORD */}
          {step === "member_otp_password" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Enter code</h2>
                <button
                  type="button"
                  onClick={() => navigateTo("member_accept")}
                  className="w-9 h-9 border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed mb-4">
                We sent a 6-digit code to <span className="text-[#1E56EC] font-bold">{invitedEmail || "get@bimbox.com"}</span>
              </p>

              <form onSubmit={handleMemberOtpPasswordVerify} noValidate className="space-y-4 text-left">
                {/* 6 OTP boxes */}
                <div className="flex justify-between gap-1.5">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={handleOtpPaste}
                      className={`w-[44px] h-[44px] lg:w-[45px] lg:h-[45px] text-center text-base font-bold rounded-xl border transition-all duration-200 outline-none hover:scale-[1.03] active:scale-[0.97]
                        ${fieldErrors.otp
                          ? "bg-rose-50/5 border-rose-400 text-rose-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-100/50 animate-shake"
                          : val 
                            ? "bg-[#1E56EC] border-[#1E56EC] text-white font-extrabold shadow-sm scale-105" 
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-slate-800 focus:border-[#1E56EC] focus:bg-white focus:ring-4 focus:ring-blue-50/50"
                        }
                      `}
                    />
                  ))}
                </div>
                {fieldErrors.otp && (
                  <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                    <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                    <span>{fieldErrors.otp}</span>
                  </div>
                )}

                {/* Password field */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Set password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showMemberPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      onFocus={() => setIsMemberPasswordFocused(true)}
                      onBlur={() => setIsMemberPasswordFocused(false)}
                      className={`w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.memberPassword 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPassword(!showMemberPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 px-1"
                    >
                      {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.memberPassword && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.memberPassword}</span>
                    </div>
                  )}
                  {renderPasswordStrengthChecklist(memberPassword, isMemberPasswordFocused)}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-3 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>

              {/* Resend actions */}
              <div className="text-center mt-5 space-y-2">
                <p className="text-xs font-semibold text-slate-450">
                  Didn't receive it?{" "}
                  <button onClick={handleResendOtp} className="text-[#1E56EC] font-bold hover:underline cursor-pointer">
                    Resend code
                  </button>
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Code expires in {formatTimer(timerSeconds)} minutes.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2C: MEMBER PROFILE SETUP */}
          {step === "member_profile" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-1.5">Profile setup</h2>
              <p className="text-xs font-semibold text-slate-450 text-left leading-normal mb-4">
                This helps teammates recognise you in the workspace.
              </p>

              <form onSubmit={handleMemberProfileSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Full name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Alex smith"
                      value={memberFullName}
                      onChange={(e) => setMemberFullName(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.memberFullName 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.memberFullName && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.memberFullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Designation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="BIM Engineer"
                      value={memberDesignation}
                      onChange={(e) => setMemberDesignation(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.memberDesignation 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.memberDesignation && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.memberDesignation}</span>
                    </div>
                  )}
                </div>

                {/* Dropdowns Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-650 mb-1.5">Role (Invited as)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleDropdown(!showRoleDropdown);
                        setShowTeamDropdown(false);
                      }}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-[#1E56EC] flex items-center justify-between select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{memberRole}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                    {showRoleDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
                        <div className="absolute top-[105%] inset-x-0 bg-white border border-[#E9EFF6] rounded-xl p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          {["Member", "Viewer", "Editor", "Admin"].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                setMemberRole(r);
                                setShowRoleDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 hover:text-slate-900 transition-all cursor-pointer"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-650 mb-1.5">Team</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTeamDropdown(!showTeamDropdown);
                        setShowRoleDropdown(false);
                      }}
                      className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-[13px] font-medium text-slate-700 flex items-center justify-between select-none cursor-pointer"
                    >
                      <span>{memberTeam}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                    {showTeamDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowTeamDropdown(false)} />
                        <div className="absolute top-[105%] inset-x-0 bg-white border border-[#E9EFF6] rounded-xl p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                          {["Architecture", "Structure", "HVAC / Mech", "Electrical", "Project Controls", "Operations"].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setMemberTeam(t);
                                setShowTeamDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-655 hover:text-slate-900 transition-all cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact phone field with country dial code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Contact number</label>
                  <div className="flex gap-2 relative">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-850 flex items-center gap-1.5 transition-all select-none cursor-pointer"
                      >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="text-[13px] font-medium text-slate-600">{selectedCountry.dialCode}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      {showCountryDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                          <div className="absolute top-[110%] left-0 w-52 bg-white border border-[#E9EFF6] rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            {COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-655 hover:text-slate-900 transition-all flex items-center gap-2.5 cursor-pointer"
                              >
                                <span className="text-lg leading-none">{country.flag}</span>
                                <span className="font-semibold">{country.dialCode}</span>
                                <span className="text-[10px] text-slate-400 font-medium truncate flex-1">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="5347668769"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                          ${fieldErrors.phone 
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5" 
                            : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                          }
                        `}
                      />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <span className="text-[10px] text-rose-500 font-bold block mt-1 pl-0.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      {fieldErrors.phone}
                    </span>
                  )}
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className={`w-4 h-4 mt-0.5 rounded border focus:ring-2
                        ${fieldErrors.agreeTerms 
                          ? "border-rose-450 text-rose-555 focus:ring-rose-200" 
                          : "border-[#E2E8F0] text-[#1E56EC] focus:ring-[#1E56EC]/30"
                        }
                      `}
                    />
                    <span className="text-xs font-semibold text-slate-500 leading-normal">
                      I agree to the{" "}
                      <a href="#terms" className="text-[#1E56EC] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#privacy" className="text-[#1E56EC] hover:underline" onClick={(e) => e.stopPropagation()}>
                        Privacy
                      </a>
                    </span>
                  </label>
                  {fieldErrors.agreeTerms && (
                    <span className="text-[10px] text-rose-500 font-bold block mt-1 pl-0.5 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      {fieldErrors.agreeTerms}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Complete setup</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2D: MEMBER COMPLETED */}
          {step === "member_completed" && (
            <div className="text-center py-4 animate-in fade-in scale-in duration-300">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-[#1E56EC] rounded-full flex items-center justify-center shadow-[0_0_36px_rgba(30,86,236,0.35)] animate-bounce-slow relative">
                  <div className="absolute inset-0 rounded-full bg-[#1E56EC]/20 animate-ping opacity-75" />
                  <Check className="w-9 h-9 text-white stroke-[3.5] relative z-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">You're in!</h2>
              <p className="text-xs font-semibold text-slate-400 mb-8 leading-relaxed max-w-[280px] mx-auto">
                Your account and workspace are ready.
              </p>

              <button
                type="button"
                onClick={() => { window.location.href = "/dashboard"; }}
                className="w-full h-11 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW 3: FORGOT PASSWORD FLOW STEPS                           */}
          {/* ============================================================ */}
          
          {/* STEP 3A: REQUEST RESET LINK */}
          {step === "forgot_request" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Forgot Password</h2>
                <button
                  type="button"
                  onClick={() => switchFlow("owner")}
                  className="w-9 h-9 border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed mb-4">
                Enter your work email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotRequestSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Work Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.email 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3B: FORGOT OTP */}
          {step === "forgot_otp" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Enter code</h2>
                <button
                  type="button"
                  onClick={() => navigateTo("forgot_request")}
                  className="w-9 h-9 border border-[#E2E8F0] hover:bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-500 text-left leading-relaxed mb-4">
                We sent a 6-digit code to <span className="text-[#1E56EC] font-bold">{email || "your email"}</span>
              </p>

              <form onSubmit={handleForgotOtpVerify} noValidate className="space-y-4">
                <div className="flex justify-between gap-1.5">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={handleOtpPaste}
                      className={`w-[44px] h-[44px] lg:w-[45px] lg:h-[45px] text-center text-base font-bold rounded-xl border transition-all duration-200 outline-none hover:scale-[1.03] active:scale-[0.97]
                        ${fieldErrors.otp
                          ? "bg-rose-50/5 border-rose-400 text-rose-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-100/50 animate-shake"
                          : val 
                            ? "bg-[#1E56EC] border-[#1E56EC] text-white font-extrabold shadow-sm scale-105" 
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-slate-800 focus:border-[#1E56EC] focus:bg-white focus:ring-4 focus:ring-blue-50/50"
                        }
                      `}
                    />
                  ))}
                </div>
                {fieldErrors.otp && (
                  <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                    <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                    <span>{fieldErrors.otp}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Verify and continue</span>
                  )}
                </button>
              </form>

              {/* Resend OTP actions */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-xs font-semibold text-slate-450">
                  Didn't receive it?{" "}
                  <button onClick={handleResendOtp} className="text-[#1E56EC] font-bold hover:underline cursor-pointer">
                    Resend code
                  </button>
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Code expires in {formatTimer(timerSeconds)} minutes.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3C: RESET PASSWORD */}
          {step === "forgot_reset" && (
            <div className="animate-in fade-in zoom-in-95 duration-250">
              <h2 className="text-2xl font-bold text-[#0F172A] text-left tracking-tight mb-4">Reset Password</h2>
              
              <form onSubmit={handleResetPasswordSubmit} noValidate className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setIsNewPasswordFocused(true)}
                      onBlur={() => setIsNewPasswordFocused(false)}
                      className={`w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.newPassword 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 px-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.newPassword}</span>
                    </div>
                  )}
                  {renderPasswordStrengthChecklist(newPassword, isNewPasswordFocused)}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-10 pl-10 pr-10 bg-[#F8FAFC] border rounded-xl text-[13px] font-medium text-slate-800 outline-none focus:ring-4 transition-all duration-200
                        ${fieldErrors.confirmPassword 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100/50 bg-rose-50/5 animate-shake" 
                          : "border-[#E2E8F0] focus:border-[#1E56EC] focus:ring-blue-50/50"
                        }
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 px-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <div className="flex items-center gap-1.5 mt-1.5 bg-rose-50/80 border border-rose-100/50 rounded-lg px-2.5 py-1 text-[10px] text-rose-600 font-semibold animate-in slide-in-from-top-1.5 fade-in duration-200 text-left">
                      <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-4 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3D: FORGOT COMPLETED */}
          {step === "forgot_completed" && (
            <div className="text-center py-4 animate-in fade-in scale-in duration-300">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-[#1E56EC] rounded-full flex items-center justify-center shadow-[0_0_36px_rgba(30,86,236,0.35)] animate-bounce-slow relative">
                  <div className="absolute inset-0 rounded-full bg-[#1E56EC]/20 animate-ping opacity-75" />
                  <Check className="w-9 h-9 text-white stroke-[3.5] relative z-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Password Reset</h2>
              <p className="text-xs font-semibold text-slate-400 mb-8 leading-relaxed max-w-[280px] mx-auto">
                Your password has been reset successfully. You can now log back in.
              </p>

              <button
                type="button"
                onClick={() => switchFlow("owner")}
                className="w-full h-11 bg-[#1E56EC] hover:bg-[#1546C7] text-white font-bold rounded-full text-xs tracking-wide transition-all duration-200 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
        @keyframes flowUp {
          to { stroke-dashoffset: -20; }
        }
        @keyframes flowDown {
          to { stroke-dashoffset: 20; }
        }
        .animate-flow-up {
          stroke-dasharray: 4, 6;
          animation: flowUp 1.2s linear infinite;
        }
        .animate-flow-down {
          stroke-dasharray: 4, 6;
          animation: flowDown 1.2s linear infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-1 { animation: float1 5s ease-in-out infinite; transform-origin: center; }
        .animate-float-2 { animation: float2 5.5s ease-in-out infinite; transform-origin: center; }
        .animate-float-3 { animation: float3 6s ease-in-out infinite; transform-origin: center; }
        .animate-float-4 { animation: float4 6.5s ease-in-out infinite; transform-origin: center; }
        @keyframes laserScan {
          0%, 100% { transform: translateY(90px); opacity: 0.15; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(420px); opacity: 0.7; }
        }
        .animate-laser-scan {
          animation: laserScan 6s ease-in-out infinite;
        }
        @keyframes flicker {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.65; }
          95% { opacity: 0.85; }
          97% { opacity: 0.3; }
          98% { opacity: 0.85; }
        }
        .animate-flicker {
          animation: flicker 4s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
