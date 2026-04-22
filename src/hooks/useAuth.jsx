// hooks/useAuth.jsx
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../lib/firebase";
import { 
  onAuthStateChanged, 
  sendEmailVerification,
  updateProfile,
  reload
} from "firebase/auth";
import { doc, getDoc, updateDoc, } from "firebase/firestore";

/**
 * Custom hook for authentication state management
 * Provides user data, role, profile completeness, and auth methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("public");
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [authProvider, setAuthProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Check if user profile is complete
  const checkProfileCompleteness = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const provider = data.authProvider || "email";
        
        // For Google auth users, check required fields
        if (provider === "google") {
          const requiredFields = ['fullName', 'dob', 'mobile'];
          const hasRequiredInfo = requiredFields.every(field => 
            data[field] && data[field] !== "" && data[field] !== null
          );
          return hasRequiredInfo;
        }
        
        // For email auth users
        const basicFields = ['fullName', 'dob', 'mobile'];
        const hasBasicInfo = basicFields.every(field => 
          data[field] && data[field] !== "" && data[field] !== null
        );
        return hasBasicInfo;
      }
      return false;
    } catch (error) {
      console.error("Error checking profile completeness:", error);
      return false;
    }
  }, []);

  // Update email verification status in Firestore
  const updateEmailVerificationStatus = useCallback(async (userId, isVerified) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        emailVerified: isVerified,
        lastEmailCheck: new Date().toISOString()
      });
      console.log(`Email verification status updated to ${isVerified}`);
    } catch (error) {
      console.error("Error updating email verification:", error);
    }
  }, []);

  // Sync email verification between Firebase Auth and Firestore
  const syncEmailVerification = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return false;

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const dbEmailVerified = userData.emailVerified || false;
        const authEmailVerified = firebaseUser.emailVerified;

        // If Firebase Auth says verified but DB doesn't, update DB
        if (authEmailVerified && !dbEmailVerified) {
          await updateEmailVerificationStatus(firebaseUser.uid, true);
          return true;
        }
        // If DB says verified but Auth doesn't, use DB status
        else if (dbEmailVerified && !authEmailVerified) {
          return true;
        } else {
          return authEmailVerified;
        }
      }
      return firebaseUser.emailVerified;
    } catch (error) {
      console.error("Error syncing email verification:", error);
      return firebaseUser.emailVerified;
    }
  }, [updateEmailVerificationStatus]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!user) return null;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setRole(data.isAdmin ? "admin" : "user");
        setAuthProvider(data.authProvider || "email");
        
        const isComplete = await checkProfileCompleteness(user.uid);
        setProfileComplete(isComplete);
        
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setError(error.message);
      return null;
    }
  }, [user, checkProfileCompleteness]);

  // Resend email verification
  const resendVerificationEmail = useCallback(async () => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    try {
      await sendEmailVerification(user);
      console.log("Verification email sent");
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      setError(error.message);
      return false;
    }
  }, [user]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      
      // Update display name in Firebase Auth if provided
      if (updates.fullName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.fullName
        });
      }
      
      await refreshUserData();
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message);
      return false;
    }
  }, [user, refreshUserData]);

  // Complete profile for Google sign-up users
  const completeGoogleProfile = useCallback(async (profileData) => {
    if (!user) {
      setError("No user logged in");
      return false;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: profileData.fullName,
        dob: profileData.dob,
        mobile: profileData.mobile,
        newsletterOptIn: profileData.newsletterOptIn || false,
        profileCompleted: true,
        completedAt: new Date().toISOString(),
      });
      
      await refreshUserData();
      return true;
    } catch (error) {
      console.error("Error completing Google profile:", error);
      setError(error.message);
      return false;
    }
  }, [user, refreshUserData]);

  // Check email verification status periodically
  const checkEmailVerification = useCallback(async () => {
    if (!user || authProvider !== "email") return false;

    try {
      await reload(user);
      const isVerified = user.emailVerified;
      setEmailVerified(isVerified);
      
      if (isVerified) {
        await updateEmailVerificationStatus(user.uid, true);
      }
      
      return isVerified;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return emailVerified;
    }
  }, [user, authProvider, emailVerified, updateEmailVerificationStatus]);

  // Sign out user
  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setRole("public");
      setEmailVerified(false);
      setProfileComplete(true);
      setAuthProvider(null);
      setUserData(null);
      setError(null);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
      return false;
    }
  }, []);

  // Initialize auth listener
  useEffect(() => {
    let unsubscribeAuth = null;
    let verificationInterval = null;

    const initAuth = async () => {
      setLoading(true);
      
      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        
        if (!firebaseUser) {
          setUser(null);
          setRole("public");
          setEmailVerified(false);
          setProfileComplete(true);
          setAuthProvider(null);
          setUserData(null);
          setError(null);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);
        
        // Sync email verification
        const isEmailVerified = await syncEmailVerification(firebaseUser);
        setEmailVerified(isEmailVerified);

        // Check if user document exists
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Check for Google sign-up temp data
          const tempData = localStorage.getItem("google_signup_temp");
          if (tempData) {
          
            // User document will be created in CompleteProfile component
            setRole("public");
            setProfileComplete(false);
            setAuthProvider("google");
          } else {
            setRole("public");
            setProfileComplete(false);
            setAuthProvider(null);
          }
          setUserData(null);
          setLoading(false);
          return;
        }

        const data = userDoc.data();
        setUserData(data);
        setRole(data.isAdmin ? "admin" : "user");
        setAuthProvider(data.authProvider || "email");
        
        const isProfileComplete = await checkProfileCompleteness(firebaseUser.uid);
        setProfileComplete(isProfileComplete);
        
        setLoading(false);
      });
    };

    initAuth();

    // Set up periodic email verification check
    verificationInterval = setInterval(() => {
      if (user && authProvider === "email" && !emailVerified) {
        checkEmailVerification();
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (verificationInterval) clearInterval(verificationInterval);
    };
  }, [syncEmailVerification, checkProfileCompleteness, checkEmailVerification, user, authProvider, emailVerified]);

  // Auto-refresh user data when user changes
  useEffect(() => {
    if (user) {
      refreshUserData();
    }
  }, [user, refreshUserData]);

  return {
    // State
    user,
    role,
    emailVerified,
    profileComplete,
    authProvider,
    loading,
    userData,
    error,
    
    // Computed properties
    isAuthenticated: !!user,
    isAdmin: role === "admin",
    isUser: role === "user",
    needsProfileCompletion: !profileComplete && !!user,
    needsEmailVerification: authProvider === "email" && !emailVerified && !!user,
    isGoogleAuth: authProvider === "google",
    isEmailAuth: authProvider === "email",
    
    // Methods
    refreshUserData,
    resendVerificationEmail,
    updateUserProfile,
    completeGoogleProfile,
    checkEmailVerification,
    signOut,
    updateEmailVerificationStatus,
  };
};

export default useAuth;