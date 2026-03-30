import { useRequestStore } from "@/stores/useRequestStore";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, Trash2, Check, X, Clock, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  approved: "text-blue-400 bg-blue-400/10",
  completed: "text-emerald-400 bg-emerald-400/10",
  rejected: "text-red-400 bg-red-400/10",
};

const RequestsTabContent = () => {
  const { requests, fetchAllRequests, updateStatus, deleteRequest } = useRequestStore();

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleStatus = async (id: string, status: string) => {
    await updateStatus(id, status);
    toast.success(`Request marked as ${status}`);
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
    toast.success("Request deleted");
  };

  return (
    <Card className='bg-zinc-800/50 border-zinc-700/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Music2 className='size-5 text-emerald-500' />
          Song Requests
          {requests.filter((r) => r.status === "pending").length > 0 && (
            <span className='bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full'>
              {requests.filter((r) => r.status === "pending").length} new
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {requests.length === 0 ? (
          <p className='text-zinc-400 text-center py-8'>No requests yet</p>
        ) : (
          <div className='space-y-3'>
            {requests.map((req) => (
              <div
                key={req._id}
                className='bg-zinc-800 rounded-lg p-4 border border-zinc-700'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>

                    <div className='flex items-center gap-2 mb-1'>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                      <span className='text-xs text-zinc-500'>
                        {req.type === "album" ? "Full Album" : "Single"}
                      </span>
                    </div>

                    <p className='font-medium text-white'>
                      {req.artistName} — {req.songName}
                    </p>

                    {req.albumName && (
                      <p className='text-sm text-zinc-400'>Album: {req.albumName}</p>
                    )}

                    {req.youtubeUrl && (
  <button
    onClick={() => window.open(req.youtubeUrl, "_blank")}
    className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1'
  >
    <ExternalLink className='h-3 w-3' />
    YouTube Link
  </button>
)}

                    {req.notes && (
                      <p className='text-xs text-zinc-500 mt-1 italic'>
                        "{req.notes}"
                      </p>
                    )}

                    <p className='text-xs text-zinc-600 mt-2'>
                      Requested by {req.requestedByName || "User"} • {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className='flex flex-col gap-1 flex-shrink-0'>
                    {req.status === "pending" && (
                      <>
                        <Button
                          size='sm'
                          onClick={() => handleStatus(req._id, "approved")}
                          className='bg-blue-500 hover:bg-blue-600 text-white h-7 text-xs'
                        >
                          <Check className='h-3 w-3 mr-1' />
                          Approve
                        </Button>
                        <Button
                          size='sm'
                          onClick={() => handleStatus(req._id, "completed")}
                          className='bg-emerald-500 hover:bg-emerald-600 text-black h-7 text-xs'
                        >
                          <Music2 className='h-3 w-3 mr-1' />
                          Added
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleStatus(req._id, "rejected")}
                          className='text-red-400 hover:text-red-300 h-7 text-xs'
                        >
                          <X className='h-3 w-3 mr-1' />
                          Reject
                        </Button>
                      </>
                    )}
                    {req.status !== "pending" && (
                      <Button
                        size='sm'
                        onClick={() => handleStatus(req._id, "pending")}
                        variant='ghost'
                        className='text-zinc-400 hover:text-white h-7 text-xs'
                      >
                        <Clock className='h-3 w-3 mr-1' />
                        Reopen
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDelete(req._id)}
                      className='text-red-400 hover:text-red-300 h-7 text-xs'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsTabContent;