"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    desc: "Personal experiments",
    features: ["3 projects", "720p export", "Community templates"],
  },
  {
    name: "Pro",
    price: "$29",
    desc: "Creators & freelancers",
    features: [
      "Unlimited projects",
      "4K export",
      "AI voices",
      "Brand kit",
      "Priority renders",
    ],
    popular: true,
  },
  {
    name: "Team",
    price: "$79",
    desc: "Studios & agencies",
    features: [
      "Everything in Pro",
      "5 seats",
      "Lambda rendering",
      "SSO ready",
      "Shared brand kits",
    ],
  },
];

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Plans for solo creators and production teams
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-2xl border bg-card p-6 shadow-sm",
              plan.popular
                ? "border-primary shadow-primary/10"
                : "border-border"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Popular
              </Badge>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={plan.popular ? "glow" : "outline"}
            >
              {plan.popular ? "Current plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
