import OauthButtons from "@/components/auth/oauth/oauth-buttons";
import SigninForm from "@/components/auth/signin/signin-form";
import Heading from "@/components/ui/heading";
import Text from "@/components/ui/text";
import Link from "next/link";

const Page = () => {
  return (
    <div className="mt-4">
      <Heading>Sign in</Heading>
      <Text className="mb-4">
        Sign in to access your account and start math wars with your friends.
      </Text>

      <SigninForm />

      <Text className="text-xs text-center space-x-1">
        <span>Already have an account?</span>
        <Link href="/sign-up" className="underline">
          <span>Sign up</span>
        </Link>
      </Text>

      <OauthButtons />
    </div>
  );
};

export default Page;