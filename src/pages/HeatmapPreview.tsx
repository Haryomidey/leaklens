import { PopupHeader } from '../components/layout/PopupHeader';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { motion } from 'motion/react';
import { AlertTriangle, MapPin } from 'lucide-react';

export default function HeatmapPreview() {
  return (
    <div className="flex flex-col min-h-full">
      <PopupHeader />
      
      <div className="flex-1 flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Heatmap Preview</h2>
            <Badge variant="low">Beta</Badge>
          </div>
        </div>

        <div className="px-4 flex-1 relative bg-zinc-200">
          {/* Mock Browser UI */}
          <div className="absolute inset-0 bg-white shadow-inner flex flex-col">
            <div className="h-4 bg-zinc-100 border-b border-zinc-200 flex items-center px-2 gap-1">
              <div className="w-1 h-1 rounded-full bg-red-400" />
              <div className="w-1 h-1 rounded-full bg-yellow-400" />
              <div className="w-1 h-1 rounded-full bg-green-400" />
            </div>
            
            <div className="p-4 space-y-4">
              <div className="h-20 bg-zinc-50 rounded-lg border-2 border-red-500 border-dashed relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <AlertTriangle className="w-4 h-4" />
                </motion.div>
                <div className="p-2">
                  <div className="h-2 w-1/2 bg-zinc-200 rounded mb-2" />
                  <div className="h-2 w-full bg-zinc-100 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-zinc-50 rounded-lg border-2 border-orange-400 border-dashed relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-3 -right-3 bg-orange-400 text-white p-1 rounded-full shadow-lg"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </motion.div>
                </div>
                <div className="h-32 bg-zinc-50 rounded-lg" />
              </div>

              <div className="h-10 bg-zinc-900 rounded-lg relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <MapPin className="w-4 h-4" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-zinc-900/5 backdrop-blur-[1px] pointer-events-none" />
        </div>

        <div className="p-4 bg-white border-t border-zinc-100">
          <p className="text-[11px] text-zinc-500 leading-tight mb-2">
            The heatmap overlay highlights elements containing detected secrets or risky configurations directly on the webpage.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Critical Secret</span>
            <span className="w-2 h-2 rounded-full bg-orange-400 ml-2" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Risk Area</span>
          </div>
        </div>
      </div>
    </div>
  );
}
