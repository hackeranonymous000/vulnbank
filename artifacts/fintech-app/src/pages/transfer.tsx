import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { ArrowRightLeft, Loader2, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { useGetAccounts, useCreateTransfer, getGetAccountsQueryKey, getGetRecentActivityQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const transferSchema = z.object({
  fromAccountId: z.coerce.number().min(1, "Please select an origin account"),
  toAccountId: z.coerce.number().min(1, "Please select a destination account"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Origin and destination accounts must be different",
  path: ["toAccountId"]
});

type TransferFormValues = z.infer<typeof transferSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function Transfer() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();
  const createTransfer = useCreateTransfer();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: 0,
      toAccountId: 0,
      amount: 0,
      description: "Internal transfer",
    },
  });

  const fromAccountId = watch("fromAccountId");
  const toAccountId = watch("toAccountId");

  const onSubmit = async (data: TransferFormValues) => {
    try {
      const result = await createTransfer.mutateAsync({ data });
      
      toast({
        title: "Transfer successful",
        description: result.message || "Funds transferred successfully.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: getGetAccountsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });

      reset();
      setLocation("/transactions");
    } catch (err: any) {
      toast({
        title: "Transfer failed",
        description: err.message || "An error occurred processing the transfer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Internal Transfer</h2>
        <p className="text-muted-foreground">Move funds instantly between your accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Transfer Funds
          </CardTitle>
          <CardDescription>Transfers are processed immediately and cannot be reversed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccountId">From Account</Label>
                <Select 
                  disabled={isLoadingAccounts} 
                  onValueChange={(val) => setValue("fromAccountId", parseInt(val, 10))}
                  value={fromAccountId ? fromAccountId.toString() : undefined}
                >
                  <SelectTrigger className="bg-black/20 h-12">
                    <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select origin account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.accountType} (••••{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fromAccountId && <p className="text-sm text-destructive">{errors.fromAccountId.message}</p>}
              </div>

              <div className="flex justify-center py-2">
                <div className="p-2 rounded-full bg-muted">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccountId">To Account</Label>
                <Select 
                  disabled={isLoadingAccounts} 
                  onValueChange={(val) => setValue("toAccountId", parseInt(val, 10))}
                  value={toAccountId ? toAccountId.toString() : undefined}
                >
                  <SelectTrigger className="bg-black/20 h-12">
                    <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select destination account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.accountType} (••••{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.toAccountId && <p className="text-sm text-destructive">{errors.toAccountId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="pl-9 h-12 bg-black/20 text-lg font-mono"
                    {...register("amount")}
                  />
                </div>
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this transfer for?"
                  className="bg-black/20 resize-none"
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 py-4 border-t border-border">
          <Button 
            type="submit" 
            form="transfer-form"
            className="w-full h-12 text-md font-medium" 
            disabled={createTransfer.isPending || isLoadingAccounts}
          >
            {createTransfer.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Execute Transfer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
