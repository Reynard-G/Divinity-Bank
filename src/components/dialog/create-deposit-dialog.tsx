"use client";

import { useActionState, useState, useCallback } from "react";

import { PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpokeSpinner } from "@/components/ui/spinner";
import { deposit } from "@/lib/db/actions/transaction.actions";

interface CreateDepositDialogProps {
  children?: React.ReactNode;
  serverId: number;
}

export function CreateDepositDialog({
  children,
  serverId,
}: CreateDepositDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      await handleFormAction(formData);
      return null;
    },
    null
  );

  const handleFormAction = useCallback(
    async (formData: FormData) => {
      if (files.length > 0) {
        formData.set("proofOfDeposit", files[0]);
      }

      try {
        const result = await deposit(formData);

        if (result.success) {
          toast.success("Success!", {
            description: result.message,
          });

          setIsDialogOpen(false);
          setFiles([]);
        } else if (result.error) {
          toast.error("Error", {
            description: result.error,
          });
        }
      } catch (error) {
        console.error("Deposit form submission error:", error);

        toast.error("Error", {
          description: "An unexpected error has occurred.",
        });
      }
    },
    [files]
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);

        // Clear files when dialog is closed
        if (!open) setFiles([]);
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <PlusIcon size={16} className="mr-2" aria-hidden="true" />
            Make Deposit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0" aria-describedby={undefined}>
        <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
          <PlusIcon size={30} aria-hidden="true" />
        </div>

        <form action={formAction}>
          <div className="mb-2 grid gap-2 px-12 text-center">
            <DialogTitle className="mb-2 text-lg font-semibold">
              Make Deposit
            </DialogTitle>

            <p className="text-base leading-6 text-muted-foreground">
              Deposit money into your account by providing the necessary details
              below. Please ensure that your <strong>minecraft username</strong>{" "}
              is the same as this account to avoid any issues.
            </p>

            <input type="hidden" name="serverId" value={serverId} />

            <div className="mb-5 mt-3 grid gap-2">
              <div className="space-y-1">
                <Label
                  htmlFor="amount"
                  className="text-left text-sm text-muted-foreground"
                >
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="100.00"
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-left text-sm text-muted-foreground">
                  Proof of Deposit
                </Label>
                <FileUpload
                  value={files}
                  onValueChange={setFiles}
                  onFileReject={onFileReject}
                  accept="image/png,image/jpeg,image/webp"
                  maxFiles={1}
                  maxSize={2 * 1024 * 1024} // 2MB
                >
                  <FileUploadDropzone className="min-h-[120px]">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Drop your proof of deposit here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPEG, WEBP up to 2MB
                        </p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          Choose File
                        </Button>
                      </FileUploadTrigger>
                    </div>
                  </FileUploadDropzone>

                  <FileUploadList className="w-full max-w-[414px]">
                    {files.map((file) => (
                      <FileUploadItem key={file.name} value={file}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <div className="flex justify-between gap-5 px-12 py-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={pending || files.length === 0}
              >
                {pending && <SpokeSpinner size="sm" className="mr-1" />}
                Submit
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
