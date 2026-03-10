"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Page from "@/components/Page";
import ViewWhiteboard from "@/components/ViewWhiteboard/viewWhiteBoard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import WhiteboardForm from "@/components/ViewWhiteboard/WhiteboardForm";
import { WhiteboardFormData } from "@/components/ViewWhiteboard/WhiteboardForm/whiteboardForm.schema";
import WhiteboardService from "@/services/whiteboard/WhiteboardService";
import { CreateWhiteboardRequest } from "@/types/whiteboard";
import { toast } from "sonner";

export default function Whiteboard() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateWhiteboard = async (data: WhiteboardFormData) => {
    try {
      setIsCreating(true);
      const whiteboardData: CreateWhiteboardRequest = {
        title: data.title,
        content: {},
      };
      const response = await WhiteboardService.create(whiteboardData);
      setIsCreateModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
      router.push(`/tools/whiteboard/${response.data.id}`);
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
      toast.error("Erro ao criar quadro. Tente novamente");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Page>
      <Page.Header
        title="Quadro"
        subtitle="Desenhe, anote e organize suas ideias em um quadro interativo!"
        buttonIcon={<Plus />}
        buttonText="Criar Quadro"
        onButtonClick={() => setIsCreateModalOpen(true)}
      />

      <Page.Content>
        <ViewWhiteboard refreshTrigger={refreshTrigger} />
      </Page.Content>

      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!isCreating) setIsCreateModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Quadro</DialogTitle>
          </DialogHeader>
          <WhiteboardForm onSubmit={handleCreateWhiteboard} isLoading={isCreating} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" form="whiteboard-form" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Quadro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
