import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
//import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { EllipsisVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { DeleteRepoFromMenuDialog, DeleteRepositoryDialog, DuplicateRepositoryDialog } from "./repository-dialogs";

type Props= {
    repoId: string
    repoName: string
}
export default function RepoMenu({ repoId, repoName }: Props) {
    return (
        <Menubar className="border-0">
            <MenubarMenu>
                <MenubarTrigger className="px-1 border-0 cursor-pointer">
                    <EllipsisVertical className="h-5 w-5" />
                </MenubarTrigger>
                <MenubarContent className="p-4 text-muted-foreground">
                    <MenubarItem asChild>
                        <DuplicateRepositoryDialog duplicationRepoId={repoId} duplicationName={repoName} />
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem asChild>
                        <DeleteRepoFromMenuDialog id={repoId} description={`Seguro que quieres eliminar el repositorio ${repoName}?`} withText={false} />
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>

    );
}