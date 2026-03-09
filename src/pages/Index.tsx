import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg h-[90vh] max-h-[800px]">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Index;
