interface TranscriptProps {
  transcript: string | null;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
  return (
    transcript && (
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Transcript</h2>
        <p className="whitespace-pre-line">{transcript}</p>
      </div>
    )
  );
};

export default Transcript;
