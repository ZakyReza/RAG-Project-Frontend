import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import ConversationSidebar from './components/chat/ConversationSidebar';
import ChatInterface from './components/chat/ChatInterface';
import DocumentManager from './components/documents/DocumentManager';
import { conversationApi, documentApi } from './lib/api';
import { Button } from './components/ui/button';
import { MessageSquare, FileText, Menu } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger,} from './components/ui/sheet';



function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    loadConversations();
    loadDocuments();
  }, []  
);

  const loadConversations = async () => {
    try {
      const response = await conversationApi.getAll();
      setConversations(response.data);
    } catch (error) {
      toast("Error loading conversations");
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentApi.getAll();
      setDocuments(response.data);
    } catch (error) {
      toast("Error loading documents");
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await conversationApi.create({
        title: 'New Conversation',
      });
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setActiveTab('chat');
      toast("Conversation created");
    } catch (error) {
      toast("Error creating conversation");
    }
  };

  const deleteConversation = async (id) => {
  try {

    await conversationApi.delete(id);

    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
    toast("Conversation deleted");
  } catch (error) {
    toast("Error deleting conversation");
    console.error('Delete error:', error);
  }
};

const handleDeleteDocument = async (documentId) => {
  try {
    await documentApi.delete(documentId);
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast("Document deleted successfully");
    loadDocuments(); 
  } catch (error) {
    toast("Error deleting document");
    console.error('Delete error:', error);
  }
};


  const MobileSidebarTrigger = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 flex flex-col h-full">
        <ConversationSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelect={setSelectedConversation}
          onCreate={createNewConversation}
          onDelete={deleteConversation}
          isMobile={true}
          />      
      </SheetContent>
    </Sheet>
  );

  return (
    <SidebarProvider>
      <div className="h-screen w-screen flex flex-col bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <MobileSidebarTrigger />
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">RAG Chat</h1>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Documents</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main Content with Proper Sidebar and Tabs Structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Sidebar */}
            <ConversationSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelect={setSelectedConversation}
              onCreate={createNewConversation}
              onDelete={deleteConversation}
              isMobile={false}
            />

            {/* Main Content Area */}
            <SidebarInset className="flex-1 flex flex-col">
              <TabsContent value="chat" className="flex-1 flex m-0 data-[state=inactive]:hidden">
                <ChatInterface
                  conversation={selectedConversation}
                  onNewConversation={createNewConversation}
                />
              </TabsContent>

              <TabsContent value="documents" className="flex-1 m-0 p-6 data-[state=inactive]:hidden overflow-auto">
                <DocumentManager
                  documents={documents}
                  onUpload={loadDocuments}
                  onRefresh={loadDocuments}
                  onDelete={handleDeleteDocument} 
                />
              </TabsContent>
            </SidebarInset>
          </div>
        </Tabs>
      </div>
      <Toaster />
    </SidebarProvider>
    
  );
}

export default App;
