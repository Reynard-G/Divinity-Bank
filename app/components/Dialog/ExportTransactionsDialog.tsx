import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useFetcher } from "@remix-run/react";
import { IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SpokeSpinner } from "~/components/ui/spinner";
import { type Transaction } from "~/lib/db/schema";
import {
  type ExportOptions,
  exportTransactionsTable,
} from "~/lib/utils/exportTable";

export type ExportTransactionsDialogFetcherResponse = {
  success: boolean;
  message?: string;
  data?: Transaction[];
};

export default function ExportTransactionsDialog() {
  const fetcher = useFetcher<ExportTransactionsDialogFetcherResponse>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [fileType, setFileType] = useState<ExportOptions["format"]>("csv");
  const [filename, setFilename] = useState<string>(
    `transactions-${new Date().toISOString().split("T")[0]}`,
  );

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data && !fetcher.data.success && fetcher.state === "idle") {
      toast.error(fetcher.data.message);
    } else if (
      fetcher.data &&
      fetcher.data.success &&
      fetcher.state === "idle"
    ) {
      try {
        exportTransactionsTable(fetcher.data.data as Transaction[], {
          filename,
          format: fileType,
        });
        toast.success("Transactions exported successfully");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error exporting transactions:", error);
        toast.error("Error exporting transactions. Please try again.");
      }
    }
  }, [fetcher.data, fetcher.state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconDownload size={16} className="mr-2" aria-hidden="true" />
          Export
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0" aria-describedby={undefined}>
        <VisuallyHidden.Root>
          <DialogTitle>Export</DialogTitle>
        </VisuallyHidden.Root>

        <div className="mx-auto mb-2 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#323232]">
          <IconDownload size={30} aria-hidden="true" />
        </div>

        <fetcher.Form
          method="post"
          action="?/export"
          encType="multipart/form-data"
        >
          <div className="mb-6 grid gap-2 px-12 text-center">
            <h1 className="mb-2 text-lg font-semibold">Export</h1>

            <div>
              <p className="text-base leading-6 text-muted-foreground">
                Are you sure you want to export & download all transactions
                without any filters applied?
              </p>
            </div>

            <div className="mt-3 grid gap-2">
              <div className="relative grid grid-cols-1 gap-1">
                <p className="text-left text-sm text-muted-foreground">
                  File Type
                </p>
                <Select
                  value={fileType}
                  onValueChange={(value) =>
                    setFileType(value as ExportOptions["format"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="csv">
                      .csv (Comma-separated Values)
                    </SelectItem>
                    <SelectItem value="json">
                      .json (JavaScript Object Notation)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative grid grid-cols-1 gap-1">
                <p className="text-left text-sm text-muted-foreground">
                  Custom File Name&nbsp;
                  <small className="text-muted-foreground">(optional)</small>
                </p>
                <Input
                  type="text"
                  name="filename"
                  placeholder="Enter file name"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Input type="hidden" name="fileType" value={fileType} />

          <div className="flex justify-between gap-5 border-t border-[#313131] px-12 py-6">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
            <Button
              type="submit"
              name="_action"
              value="export"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <SpokeSpinner size="sm" className="mr-1" />}
              {isSubmitting ? "Exporting..." : "Download"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
