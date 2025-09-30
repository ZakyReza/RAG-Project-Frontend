import React, { useState } from 'react';
import {Sidebar,
        SidebarContent,
        SidebarHeader,
        SidebarMenu,
        SidebarMenuButton,
        SidebarMenuItem,
        SidebarGroup,
        SidebarGroupLabel,
        SidebarGroupContent,
       } from '../ui/sidebar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import {AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        } from '../ui/alert-dialog';
import { Plus, Search, MessageSquare, Trash2, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

const ConversationSidebar = ({
  conversations,
  selectedConversation,
  onSelect,
  onCreate,
  onDelete,
  isMobile = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (conversationId, e) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      onDelete(conversationToDelete);
      toast("The conversation has been successfully deleted");
    } catch (error) {
      toast("Error deleting conversation, Please try again");
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

return (
  <>
    {isMobile ? (
      <div className="flex flex-col h-full">
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 mr-2" />
            <h2 className="text-xl font-semibold">RAG Chat</h2>
          </div>
          <Separator className="my-1"/>
          <div className='flex items-center justify-between'>
              <h3 className="text-l font-semibold">Start Chatting </h3>
            <Button onClick={onCreate} size="icon" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
            </div>   
            <Separator className="my-1"/>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">
                        {conversations.length === 0 ? 'No conversations yet' : 'No matches found'}
                      </p>
                    </div>
                  </SidebarMenuItem>
                ) : (
                  filteredConversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        isActive={selectedConversation?.id === conversation.id}
                        onClick={() => onSelect(conversation)}
                        className="group relative"
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <MessageSquare className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium truncate">{conversation.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(conversation.updated_at)}</span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => handleDeleteClick(conversation.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {conversation.messages?.length || 0}
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4" />

          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    ) : (
      <Sidebar className="hidden md:flex">
        <SidebarHeader className="p-4 border-b">  <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button onClick={onCreate} size="icon" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div></SidebarHeader>
        <SidebarContent> 
          <SidebarGroup>
            <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">
                        {conversations.length === 0 ? 'No conversations yet' : 'No matches found'}
                      </p>
                    </div>
                  </SidebarMenuItem>
                ) : (
                  filteredConversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        isActive={selectedConversation?.id === conversation.id}
                        onClick={() => onSelect(conversation)}
                        className="group relative"
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <MessageSquare className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium truncate">{conversation.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(conversation.updated_at)}</span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => handleDeleteClick(conversation.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {conversation.messages?.length || 0}
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4" />

          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup> </SidebarContent>
      </Sidebar>
    )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the conversation
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationSidebar;