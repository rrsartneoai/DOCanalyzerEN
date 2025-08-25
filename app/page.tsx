import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { RocketIcon, FileTextIcon, DollarSignIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container px-4 md:px-6 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                AI-Powered Document Analysis
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl">
                Unlock insights from your documents with our advanced AI platform. Streamline your workflow and make
                data-driven decisions.
              </p>
              <div className="space-x-4">
                <Link href="/auth/register" passHref>
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg">Get Started</Button>
                </Link>
                <Link href="/auth/login" passHref>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg bg-transparent"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center text-center p-6">
                <RocketIcon className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl font-bold mb-2">Fast & Accurate</CardTitle>
                <CardDescription>
                  Get quick and precise analysis of your documents using state-of-the-art AI models.
                </CardDescription>
              </Card>
              <Card className="flex flex-col items-center text-center p-6">
                <FileTextIcon className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl font-bold mb-2">Multiple Formats</CardTitle>
                <CardDescription>
                  Supports various document types including PDFs, DOCX, TXT, and images.
                </CardDescription>
              </Card>
              <Card className="flex flex-col items-center text-center p-6">
                <DollarSignIcon className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl font-bold mb-2">Flexible Pricing</CardTitle>
                <CardDescription>
                  Affordable plans tailored to your analysis needs, with transparent pricing.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">Ready to get started?</h2>
            <Link href="/auth/register" passHref>
              <Button className="px-10 py-4 text-xl">Sign Up Now</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-950 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="container px-4 md:px-6">
          &copy; {new Date().getFullYear()} Document Analysis Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
